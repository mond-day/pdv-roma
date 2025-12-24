# Análise de Inconsistências de Dados - Carregamentos

## 🔴 Problemas Identificados pelo Usuário

### 1. Peso Líquido
- ✅ Aparece na **lista de carregamentos** (tabela)
- ❌ NÃO aparece no **modal de detalhes**

### 2. Dados de Carregamento Parcial (Standby)
Ao clicar em "Pesar" em um carregamento standby, os seguintes dados NÃO aparecem:
- ❌ Quantidade de eixos
- ❌ Produto selecionado
- ❌ Placa
- ❌ Motorista
- ❌ Transportadora
- ❌ Tara

### 3. Select de Produto Vazio
- ❌ Ao iniciar novo carregamento (do 0, a partir de contrato)
- ❌ Select não carrega opções

### 4. Auto-Preenchimento Não Funciona
- ❌ Placa selecionada MAS motorista/transportadora não preenchem automaticamente

### 5. Input de Eixo Resetando
- ❌ Ainda está acontecendo ghosting durante digitação

---

## 📋 Mapeamento de Dados - Tabela `carregamentos`

### Campos Necessários (baseado no uso)

```
carregamentos:
├── id (PK)
├── venda_id (FK → vendas.id_gc)
├── status (standby, finalizado, cancelado)
├── placa
├── cliente_nome
├── contrato_codigo
├── produto_venda_id (FK → produtos_venda.id)
├── detalhes_produto (TEXT - informações adicionais)
├── qtd_desejada (TEXT)
├── data_carregamento (DATE)
├── tara_total (NUMERIC - em TON)
├── peso_final_total (NUMERIC - em gramas)
├── eixos (INTEGER - quantidade de eixos)
├── tara_eixos (JSONB - array de pesos em kg)
├── peso_final_eixos (JSONB - array de pesos em kg)
├── motorista_id (FK → motoristas.id)
├── transportadora_id (BIGINT → transportadoras.id_gc)
├── observacoes (TEXT)
├── finalizado_em (TIMESTAMP)
├── cancelado_em (TIMESTAMP)
└── cancelamento_motivo (TEXT)
```

### Relacionamentos

```
carregamentos
  → vendas (id_gc = venda_id)
  → produtos_venda (id = produto_venda_id, venda_id = venda_id)
  → motoristas (id = motorista_id)
  → transportadoras (id_gc::text = transportadora_id::text)
  → integracoes_n8n (carregamento_id = id)
```

---

## 🔍 Análise de Queries Atuais

### Query: `getCarregamentoById`

**Arquivo:** `lib/db/queries/carregamentos.ts:180-250`

**JOINs atuais:**
```sql
LEFT JOIN vendas v ON v.id_gc = c.id_gc
LEFT JOIN produtos_venda pv ON pv.id = c.produto_venda_id AND pv.venda_id = c.venda_id
LEFT JOIN integracoes_n8n i ON i.carregamento_id = c.id
```

**Campos retornados:**
- ✅ id, status, placa
- ✅ cliente_nome (de vendas ou fallback)
- ✅ contrato_codigo (de vendas ou fallback)
- ✅ produto_nome (de produtos_venda)
- ✅ detalhes_produto
- ✅ qtd_desejada
- ✅ tara_total, peso_final_total
- ✅ eixos
- ✅ tara_eixos_kg, final_eixos_kg (convertido de JSONB)
- ✅ observacoes
- ❌ **motorista_id** (retorna mas não o nome)
- ❌ **transportadora_id** (retorna mas não o nome)
- ❌ **peso_liquido** (não calculado)

### Query: `listCarregamentos`

**Arquivo:** `lib/db/queries/carregamentos.ts:5-178`

**JOINs atuais:**
```sql
LEFT JOIN vendas v ON v.id_gc = c.id_gc
LEFT JOIN produtos_venda pv ON pv.id = c.produto_venda_id
LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
LEFT JOIN motoristas m ON m.id = c.motorista_id
LEFT JOIN integracoes_n8n i ON i.carregamento_id = c.id
```

**Campos retornados:**
- ✅ transportadora_nome
- ✅ motorista_nome
- ✅ liquido_kg (calculado: peso_final_total - tara_total)

**🔴 INCONSISTÊNCIA IDENTIFICADA:**
- `listCarregamentos` tem JOINs com motoristas e transportadoras
- `getCarregamentoById` NÃO tem esses JOINs
- Por isso motorista/transportadora aparecem na lista mas não nos detalhes!

---

## ❓ PERGUNTAS ANTES DE CORRIGIR

### 1. Peso Líquido no Modal de Detalhes
**Pergunta:** O peso líquido deve ser calculado como `peso_final_total - tara_total` e exibido no modal?
**Cálculo:** Peso Líquido (kg) = peso_final_total (gramas) / 1000 - tara_total (TON) * 1000?

**Opções:**
- A) Sim, calcular e mostrar no modal
- B) Não, deixar apenas na lista

### 2. Tara Total vs Tara Eixos
**Pergunta:** `tara_total` é redundante com `tara_eixos`?
**Contexto:**
- `tara_total` armazena em TON (NUMERIC)
- `tara_eixos` armazena array em kg (JSONB)
- A soma dos eixos deve ser igual à tara_total?

**Opções:**
- A) Sim, tara_total = SUM(tara_eixos)
- B) Não, podem ser diferentes
- C) tara_total é calculado, não precisa ser armazenado

### 3. Dados ao Pesar Carregamento Standby
**Pergunta:** Quando clica em "Pesar" em um carregamento standby, TODOS os dados devem ser preenchidos automaticamente?

**Dados a preencher:**
- Quantidade de eixos → De onde vem? `carregamentos.eixos`
- Produto → De onde vem? `carregamentos.produto_venda_id`
- Placa → De onde vem? `carregamentos.placa`
- Motorista → De onde vem? `carregamentos.motorista_id`
- Transportadora → De onde vem? `carregamentos.transportadora_id`
- Tara → De onde vem? `carregamentos.tara_eixos_kg`

**Confirmação:** Todos devem ser preenchidos automaticamente no formulário?

### 4. Select de Produto ao Criar Carregamento Novo
**Pergunta:** Ao selecionar um contrato (venda), o select de produto deve:

**Opções:**
- A) Carregar todos os produtos da venda (JOIN produtos_venda WHERE venda_id = ?)
- B) Mostrar apenas produtos com quantidade disponível > 0
- C) Mostrar todos mas desabilitar os sem quantidade

### 5. Auto-Preenchimento de Motorista/Transportadora
**Pergunta:** Quando seleciona uma placa, motorista/transportadora devem ser preenchidos:

**Opções:**
- A) Do último carregamento com essa placa
- B) Das tabelas `placas_motorista` e `placas_transportadora` (vínculo fixo)
- C) Deixar vazio para usuário escolher

**Contexto:** A API `/api/placas/search` retorna `motorista_id` e `transportadora_id` do ÚLTIMO carregamento. Isso está correto?

### 6. Input de Eixo Resetando
**Pergunta:** O problema persiste mesmo após a correção de armazenar em TON?

**Debug necessário:**
- Verificar se `EixoInput.onChange` está sendo chamado no `onBlur` ou no `onChange`
- Verificar se o estado pai está atualizando corretamente

### 7. Conversão de Unidades
**Confirmação das unidades:**

**Banco de dados:**
- `tara_total`: NUMERIC em **TON**
- `peso_final_total`: NUMERIC em **gramas**
- `tara_eixos`: JSONB array em **kg**
- `peso_final_eixos`: JSONB array em **kg**

**Interface (inputs):**
- Inputs de eixo: **TON** (com vírgula)

**Conversões corretas:**
```javascript
// Tara
tara_total (TON) * 1000 = kg
tara_eixos[i] (kg)

// Peso Final
peso_final_total (gramas) / 1000 = kg
peso_final_eixos[i] (kg)

// Líquido
liquido_kg = peso_final_total (gramas) / 1000 - tara_total (TON) * 1000
```

Está correto?

---

## 🎯 Plano de Correção (AGUARDANDO RESPOSTAS)

1. **Adicionar JOINs no getCarregamentoById**
   - JOIN com motoristas
   - JOIN com transportadoras
   - Calcular peso líquido

2. **Preencher dados ao pesar standby**
   - Popular todos os campos do formulário
   - Incluir eixos, produto, placa, motorista, transportadora

3. **Corrigir select de produto**
   - Garantir que carrega produtos da venda
   - Mostrar quantidade disponível

4. **Corrigir auto-preenchimento**
   - Garantir que placaDataMap é populado
   - Garantir que handlePlacaChange é chamado

5. **Debug input de eixo**
   - Adicionar logs detalhados
   - Verificar fluxo de atualização

---

## 📝 AGUARDANDO APROVAÇÃO

Por favor, responda as perguntas acima (1-7) antes de eu implementar qualquer correção.
Isso garantirá que as correções sejam feitas de forma alinhada com as regras de negócio.
