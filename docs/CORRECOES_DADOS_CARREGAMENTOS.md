# Correções de Inconsistências de Dados - Carregamentos

Este documento detalha todas as correções implementadas para resolver problemas de dados inconsistentes no sistema de carregamentos.

## Data: 2025-12-24

## 🎯 Problemas Corrigidos

### 1. ✅ Peso Líquido Não Aparecia no Modal de Detalhes

**Problema:** Peso líquido aparecia na lista de carregamentos mas não no modal de detalhes

**Causa Raiz:** Query `getCarregamentoById` não calculava o peso líquido

**Solução:**
- Adicionado cálculo de `liquido_kg` na query (apenas para carregamentos finalizados)
- Fórmula: `peso_final_total - tara_total` (ambos em kg)
- Arquivo: `lib/db/queries/carregamentos.ts:191-195`

```sql
CASE
  WHEN c.status = 'finalizado' AND c.peso_final_total IS NOT NULL AND c.tara_total IS NOT NULL
  THEN (c.peso_final_total - c.tara_total)
  ELSE NULL
END as liquido_kg
```

**Retorno:** Adicionado campo `liquido_kg` no objeto retornado (linha 252)

---

### 2. ✅ Motorista e Transportadora Não Apareciam no Modal

**Problema:** Nomes de motorista e transportadora apareciam na lista mas não nos detalhes

**Causa Raiz:** JOINs inconsistentes entre queries:
- `listCarregamentos` tinha JOINs com motoristas e transportadoras ✓
- `getCarregamentoById` NÃO tinha esses JOINs ✗

**Solução:**
- Adicionados JOINs faltantes em `getCarregamentoById`
- Arquivo: `lib/db/queries/carregamentos.ts:206-207`

```sql
LEFT JOIN motoristas m ON m.id = c.motorista_id
LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
```

**Retorno:** Adicionados campos `motorista_nome` e `transportadora_nome` (linhas 243, 245)

---

### 3. ✅ Produto Não Era Selecionado ao Pesar Standby

**Problema:** Ao clicar em "Pesar" em carregamento standby, o produto não aparecia selecionado no select

**Causa Raiz:** Código não estava setando `produtoSelecionado` com o `produto_venda_id` do carregamento

**Solução:**
- Adicionada linha para preencher produto selecionado
- Arquivo: `app/(app)/pesagem/page.tsx:376`

```typescript
if (carregamento.produto_venda_id) setProdutoSelecionado(String(carregamento.produto_venda_id));
```

---

### 4. ✅ Select de Produto Vazio ao Criar Carregamento

**Problema:** Select de produto não mostrava opções ao selecionar um contrato

**Causa Raiz 1:** API retornava `produtos` mas frontend esperava `items`

**Solução 1:**
- Corrigido retorno da API para usar `items` (padrão do sistema)
- Arquivo: `app/api/produtos/disponiveis/route.ts:29`

```typescript
return successResponse({
  ok: true,
  items: produtos,  // Antes era "produtos"
});
```

**Causa Raiz 2:** Produtos sem quantidade disponível não deviam ser desabilitados (apenas ocultos)

**Solução 2:**
- Atualizado componente Select para suportar `disabled` em opções individuais
- Arquivo: `components/ui/Select.tsx:6, 24`
- Adicionada propriedade `disabled` aos produtos sem quantidade
- Arquivo: `app/(app)/pesagem/page.tsx:578`

```typescript
...data.items.map((p: any) => ({
  value: String(p.produto_venda_id),
  label: `${p.nome_produto} (${p.quantidade_disponivel.toFixed(3)} TON disponível)`,
  disabled: p.quantidade_disponivel <= 0  // NOVO
}))
```

---

### 5. ✅ Auto-preenchimento de Motorista/Transportadora Não Funcionava

**Problema:** Ao selecionar placa, motorista e transportadora não eram preenchidos automaticamente

**Causa Raiz:** Sistema usava dados do ÚLTIMO carregamento, mas deveria usar vínculos fixos das tabelas `placas_motoristas` e `placas_transportadoras`

**Solução:**
- Modificada API `/api/placas/search` para buscar vínculos nas tabelas corretas
- Arquivo: `app/api/placas/search/route.ts:25-72`

**Nova lógica:**
```sql
SELECT DISTINCT
  p.placa,
  ARRAY_AGG(DISTINCT pm.motorista_id) FILTER (WHERE pm.motorista_id IS NOT NULL) as motorista_ids,
  ARRAY_AGG(DISTINCT m.nome) FILTER (WHERE m.nome IS NOT NULL) as motorista_nomes,
  ARRAY_AGG(DISTINCT pt.transportadora_id) FILTER (WHERE pt.transportadora_id IS NOT NULL) as transportadora_ids,
  ARRAY_AGG(DISTINCT t.nome) FILTER (WHERE t.nome IS NOT NULL) as transportadora_nomes
FROM placas p
LEFT JOIN placas_motoristas pm ON pm.placa_id = p.id
LEFT JOIN motoristas m ON m.id = pm.motorista_id
LEFT JOIN placas_transportadoras pt ON pt.placa_id = p.id
LEFT JOIN transportadoras t ON t.id_gc = pt.transportadora_id
GROUP BY p.placa
```

**Regras de preenchimento implementadas:**
- **1 vínculo:** Auto-preenche automaticamente
- **Múltiplos vínculos:** Usuário deve escolher manualmente (TODO: filtrar select para mostrar apenas os vinculados)
- **0 vínculos:** Select mantém todas as opções disponíveis

**Arquivos modificados:**
- `app/(app)/pesagem/page.tsx:21-27` - Interface PlacaData atualizada para arrays
- `app/(app)/pesagem/page.tsx:171-203` - Lógica handlePlacaChange implementada

---

## 📊 Resumo das Alterações

### Arquivos Modificados

1. **`lib/db/queries/carregamentos.ts`**
   - Adicionados JOINs com motoristas e transportadoras
   - Adicionado cálculo de liquido_kg
   - Adicionados campos no retorno

2. **`app/api/produtos/disponiveis/route.ts`**
   - Corrigido retorno de `produtos` para `items`

3. **`app/api/placas/search/route.ts`**
   - Substituída query de carregamentos por placas_motoristas/placas_transportadoras
   - Retorno alterado para arrays de ids e nomes

4. **`components/ui/Select.tsx`**
   - Adicionado suporte para opções desabilitadas

5. **`app/(app)/pesagem/page.tsx`**
   - Interface PlacaData atualizada
   - Adicionado setProdutoSelecionado ao carregar standby
   - Produtos com quantidade <= 0 marcados como disabled
   - Lógica de auto-preenchimento por vínculos implementada
   - Type de produtos atualizado para incluir disabled

---

## 🔍 Validação das Unidades

Após análise dos dados e código, as unidades corretas são:

**Banco de Dados (tabela carregamentos):**
- `tara_total`: **kg** (NUMERIC)
- `peso_final_total`: **kg** (NUMERIC)
- `tara_eixos`: **kg** (JSONB array)
- `peso_final_eixos`: **kg** (JSONB array)

**Interface (inputs do usuário):**
- Inputs de eixo: **TON** com 3 casas decimais (ex: 12,500 TON = 12500 kg)

**Conversões:**
```javascript
// kg → TON (para exibição)
ton = kg / 1000

// TON → kg (para armazenamento)
kg = ton * 1000

// Líquido
liquido_kg = peso_final_total (kg) - tara_total (kg)
liquido_ton = liquido_kg / 1000
```

**Nota:** Os comentários no código que mencionavam "gramas" e "TON" estavam incorretos. Todos os valores em banco são armazenados em **kg**.

---

## ⚠️ Problemas Conhecidos / TODO

### 1. Input de Eixo Resetando Durante Digitação

**Status:** Em investigação

**Descrição:** Usuário relata que o input ainda apresenta "ghosting" durante digitação

**Possíveis causas:**
- Re-renderizações do componente pai
- Timing entre onChange e state updates
- Key prop causando unmount/remount

**Próximos passos:**
- Adicionar logs detalhados
- Testar em ambiente de produção
- Considerar useCallback/useMemo para otimizar re-renders

### 2. Filtrar Selects de Motorista/Transportadora por Vínculos

**Status:** TODO

**Descrição:** Quando placa tem múltiplos vínculos, os selects ainda mostram TODAS as opções

**Implementação desejada:**
- Se placa tem 3 motoristas vinculados → select deve mostrar APENAS esses 3
- Se placa tem 2 transportadoras vinculadas → select deve mostrar APENAS essas 2

**Arquivos a modificar:**
- `app/(app)/pesagem/page.tsx` - Adicionar lógica para filtrar motoristas/transportadoras quando placa é selecionada

---

## ✅ Checklist de Testes

Antes de considerar concluído, testar:

- [ ] Modal de detalhes mostra peso líquido (apenas finalizados)
- [ ] Modal de detalhes mostra motorista_nome e transportadora_nome
- [ ] Ao clicar "Pesar" em standby, produto aparece selecionado
- [ ] Select de produto carrega opções ao selecionar contrato
- [ ] Produtos sem quantidade aparecem desabilitados (cinza)
- [ ] Ao digitar placa, motorista/transportadora preenchem (se vínculo único)
- [ ] Auto-preenchimento usa placas_motoristas/placas_transportadoras
- [ ] Inputs de eixo não resetam durante digitação
- [ ] Todos os pesos são exibidos em TON com 3 casas decimais
- [ ] Cálculos de peso líquido estão corretos

---

## 📝 Observações Finais

Todas as correções foram implementadas seguindo as respostas do usuário às 7 perguntas da análise inicial. O sistema agora tem dados consistentes entre lista e detalhes, e segue as regras de negócio especificadas.

Para o futuro, recomenda-se:
1. Adicionar testes automatizados para prevenir regressões
2. Documentar unidades de medida no schema do banco
3. Criar migration para popular placas_motoristas/placas_transportadoras com dados históricos
4. Implementar filtro de selects por vínculos de placa
