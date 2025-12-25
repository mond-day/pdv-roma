# Correções: Input de Eixo (Ghosting) e Vínculos de Placas

Data: 2025-12-25

## 🎯 Problemas Corrigidos

### 1. ✅ Input de Eixo com Ghosting Durante Digitação

**Problema:** Input de peso do eixo apresentava "ghosting" - valores resetavam ou desapareciam durante a digitação.

**Análise da Solução do AppSmith:**

No AppSmith, a estratégia funciona porque eles usam **dois arrays separados**:

```javascript
// AppSmith - docs/PDV_Roma_JSObjects_analise.md:2051-2089
onInputEixoChange(i, text) {
  // Array RAW: texto bruto digitado pelo usuário
  const raw = [...appsmith.store.pesosFinalRaw];
  raw[idx] = s;  // Armazena SEMPRE, mesmo se inválido
  storeValue("pesosFinalRaw", raw);

  // Array VALIDADO: apenas se valor for válido (okStrict)
  if (okStrict) {
    const kgArr = [...appsmith.store.pesosFinal];
    const kg = this._parseKgFromTonBR(s, require3);
    if (Number.isFinite(kg) && kg >= 0) {
      kgArr[idx] = kg;
      storeValue("pesosFinal", kgArr);
    }
  }
}
```

**Princípios-Chave:**
1. **Texto bruto** (raw) é atualizado **SEMPRE** durante digitação
2. **Valor validado** só é atualizado se o texto for válido
3. Input mostra o **texto bruto**, não o valor validado
4. Formatação acontece **apenas** após blur (não durante digitação)

**Causa Raiz do Bug:**

No componente `EixoInput.tsx`, a linha 102 estava **resetando o valor ao focar**:

```typescript
// ❌ ANTES (causava ghosting)
onFocus={() => {
  setIsFocused(true);
  setLocalValue(peso);  // ← RESETAVA o valor com o prop!
}}
```

Isso causava:
- Usuário digita "12" → localValue = "12"
- Usuário clica no input (refocus) → localValue resetado para prop peso
- Valor desaparece ou volta ao anterior = ghosting

**Solução Implementada:**

```typescript
// ✅ DEPOIS (sem ghosting)
onFocus={() => {
  setIsFocused(true);
  // NÃO resetar - manter o que o usuário digitou
}}
```

**Fluxo Correto Agora:**

```typescript
// Estado local: armazena texto bruto durante digitação
const [localValue, setLocalValue] = useState(peso);
const [isFocused, setIsFocused] = useState(false);

// Sincroniza com prop APENAS quando não está focado
useEffect(() => {
  if (!isFocused) {
    setLocalValue(peso);
  }
}, [peso, isFocused]);

// Durante digitação: atualiza APENAS localValue
onChange={(e) => {
  setLocalValue(e.target.value);  // Não chama props.onChange
}}

// Ao sair: formata E notifica pai
onBlur={(e) => {
  setIsFocused(false);
  const formatted = formatValue(e.target.value);
  setLocalValue(formatted);
  props.onChange(formatted);  // Agora sim notifica pai
}}
```

**Arquivos Modificados:**
- `components/ui/EixoInput.tsx:99-102` - Removido reset no onFocus
- `components/ui/EixoInput.tsx:39-40` - Simplificado para usar sempre localValue

---

### 2. ✅ Vínculos de Placas Não Populados no Seed Data

**Problema:** Tabelas `placas_motoristas` e `placas_transportadoras` estavam vazias, então o auto-preenchimento não funcionava.

**Causa Raiz:** Seed data não incluía INSERT para essas tabelas de vínculos.

**Solução:**

Criados dois arquivos:

#### A) Script SQL adicionado ao seed (lib/db/migrations/003_seed_fake_data.sql)

```sql
-- Inserir placas únicas (extraídas dos carregamentos)
INSERT INTO placas (placa)
SELECT DISTINCT placa
FROM carregamentos
WHERE placa IS NOT NULL
ON CONFLICT (placa) DO NOTHING;

-- Vínculos placas → motoristas
INSERT INTO placas_motoristas (placa_id, motorista_id)
SELECT DISTINCT
  p.id as placa_id,
  c.motorista_id
FROM carregamentos c
JOIN placas p ON p.placa = c.placa
WHERE c.motorista_id IS NOT NULL
ON CONFLICT (placa_id, motorista_id) DO NOTHING;

-- Vínculos placas → transportadoras
INSERT INTO placas_transportadoras (placa_id, transportadora_id)
SELECT DISTINCT
  p.id as placa_id,
  c.transportadora_id::text
FROM carregamentos c
JOIN placas p ON p.placa = c.placa
WHERE c.transportadora_id IS NOT NULL
ON CONFLICT (placa_id, transportadora_id) DO NOTHING;

-- Adicionar vínculo múltiplo para teste (placa ABC-1234 com 2 motoristas)
DO $$
DECLARE
  placa_abc_id INTEGER;
BEGIN
  SELECT id INTO placa_abc_id FROM placas WHERE placa = 'ABC-1234' LIMIT 1;

  IF placa_abc_id IS NOT NULL THEN
    INSERT INTO placas_motoristas (placa_id, motorista_id)
    SELECT placa_abc_id, id
    FROM motoristas
    WHERE id != (SELECT motorista_id FROM placas_motoristas WHERE placa_id = placa_abc_id LIMIT 1)
    LIMIT 1
    ON CONFLICT (placa_id, motorista_id) DO NOTHING;
  END IF;
END $$;
```

#### B) Script TypeScript executável (scripts/seed-placas.ts)

Script standalone que pode ser executado após rodar o seed principal:

```bash
npx tsx scripts/seed-placas.ts
```

**Resultado Esperado:**
- Placas extraídas dos carregamentos existentes
- Vínculos 1:1 entre placas e motoristas/transportadoras
- Pelo menos 1 placa com múltiplos vínculos (para testar a lógica)

**Como Executar:**

```bash
# Opção 1: Executar seed completo (inclui vínculos de placas)
npm run db:reset  # ou comando equivalente que execute 003_seed_fake_data.sql

# Opção 2: Executar apenas vínculos de placas
npx tsx scripts/seed-placas.ts
```

---

## 📊 Validação

### Input de Eixo
- [ ] Digitar "12,345" não causa reset durante digitação
- [ ] Clicar no input (refocus) mantém o valor digitado
- [ ] Valor é formatado apenas ao sair do input (blur)
- [ ] Backspace/Delete funcionam normalmente
- [ ] Copiar/Colar funciona corretamente

### Vínculos de Placas
- [ ] Após seed, tabelas `placas`, `placas_motoristas` e `placas_transportadoras` têm dados
- [ ] Buscar placa retorna motoristas e transportadoras vinculados
- [ ] Placa com 1 vínculo: auto-preenche motorista/transportadora
- [ ] Placa com múltiplos vínculos: usuário precisa escolher

---

## 🔍 Comparação: Next.js vs AppSmith

| Aspecto | AppSmith | Next.js (Nossa Solução) |
|---------|----------|-------------------------|
| **Estado RAW** | `appsmith.store.pesosFinalRaw` (array) | `localValue` (estado do componente) |
| **Estado VALIDADO** | `appsmith.store.pesosFinal` (array) | `pesosEixos` (estado do pai) |
| **Sincronização** | storeValue() manual | useEffect() automático |
| **Validação** | No onChange, condicional | No onBlur, sempre |
| **Formatação** | Durante onChange | Apenas no onBlur |
| **Re-renders** | Controlado pelo framework | React.memo + useCallback |

**Vantagem da solução Next.js:**
- Mais simples (não precisa gerenciar 2 arrays no pai)
- Estado local encapsulado no componente
- Sincronização automática via useEffect

**Desvantagem:**
- Precisa garantir que o componente pai não force re-renders desnecessários

---

## 📝 Lições Aprendidas

### 1. **Nunca resete estado local no onFocus**
```typescript
// ❌ ERRADO
onFocus={() => setLocalValue(props.value)}

// ✅ CORRETO
onFocus={() => setIsFocused(true)}
```

### 2. **Separar texto bruto de valor validado**
- Input controlado por estado local (texto livre)
- Validação apenas ao sair (blur)
- Pai recebe valor formatado/validado

### 3. **Use guards no useEffect para evitar loops**
```typescript
useEffect(() => {
  if (!isFocused) {  // ← Guard essencial
    setLocalValue(peso);
  }
}, [peso, isFocused]);
```

### 4. **Seed data deve incluir tabelas de relacionamento**
- Não basta ter dados nas tabelas principais
- Vínculos M-N precisam ser populados
- Incluir casos de teste (vínculos múltiplos)

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Performance do EixoInput**
   - Adicionar React.memo() ao componente
   - useCallback() nos handlers do pai
   - Evitar re-renders desnecessários

2. **Filtrar Selects por Vínculos**
   - Quando placa tem múltiplos motoristas → mostrar apenas os vinculados no select
   - Implementar no `handlePlacaChange` da pesagem page

3. **Testes Automatizados**
   - Testes de digitação no EixoInput
   - Testes de auto-preenchimento de placas
   - Testes de vínculos múltiplos

4. **Migration de Dados Históricos**
   - Popular `placas_motoristas` com dados de carregamentos antigos
   - Popular `placas_transportadoras` com dados de carregamentos antigos
   - Garantir integridade referencial

---

## 📚 Referências

- `docs/PDV_Roma_JSObjects_analise.md:1674-1696` - handleChangeEixo do AppSmith
- `docs/PDV_Roma_JSObjects_analise.md:2044-2090` - onInputEixoChange do AppSmith
- `components/ui/EixoInput.tsx` - Componente corrigido
- `scripts/seed-placas.ts` - Script de seed de vínculos
