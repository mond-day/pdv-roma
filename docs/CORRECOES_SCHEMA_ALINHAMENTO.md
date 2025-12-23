# 🔧 Correções de Alinhamento com Schema Real

## 📋 Resumo

Este documento lista todas as correções realizadas para alinhar o código com o schema real do banco de dados PostgreSQL.

---

## 🗄️ Diferenças Identificadas entre Schema Esperado vs Real

### **Tabela `carregamentos`**

| Campo Esperado | Campo Real | Correção |
|---------------|------------|----------|
| `cliente_nome` | ❌ Não existe | ✅ Buscar de `vendas.nome_cliente` via JOIN |
| `contrato_codigo` | ❌ Não existe | ✅ Buscar de `vendas.codigo` via JOIN |
| `produto_nome` | ❌ Não existe | ✅ Usar `detalhes_produto` |
| `bruto_kg` | ❌ Não existe | ✅ Usar `peso_final_total` (em TON) |
| `liquido_kg` | ❌ Não existe | ✅ Calcular: `(peso_final_total - tara_total) * 1000` |
| `tara_kg` | ❌ Não existe | ✅ Usar `tara_total` (em TON) |
| `tara_eixos_kg` | ✅ Existe | ✅ É JSONB array: `[8500, 8200, 8300]` |
| `final_eixos_kg` | ❌ Não existe | ✅ Usar `peso_final_eixos` (JSONB array) |
| `qtd_desejada_ton` | ❌ Não existe | ✅ Usar `qtd_desejada` (TEXT) |
| `status = 'standby'` | ❌ Incorreto | ✅ Usar `'stand-by'` (com hífen) |
| `status = 'finalizado'` | ❌ Incorreto | ✅ Usar `'concluido'` (sem acento) |
| `data_carregamento` | ✅ Existe | ✅ É TIMESTAMP (não DATE) |
| `venda_id` | ✅ Existe | ✅ É TEXT (obrigatório) |

### **Tabela `vendas`**

| Campo | Tipo Real | Observação |
|-------|-----------|------------|
| `id_gc` | TEXT (PK) | ✅ Correto |
| `codigo` | TEXT | ✅ Correto |
| `nome_cliente` | TEXT | ✅ Correto |
| `transportadora_id` | TEXT | ✅ Correto |

### **Tabela `produtos_venda`**

| Campo | Tipo Real | Observação |
|-------|-----------|------------|
| `venda_id` | TEXT | ✅ Correto |
| `valor_unitario` | NUMERIC | ✅ Adicionado no seed |
| `valor_total` | NUMERIC | ✅ Adicionado no seed |

### **Tabela `logs_acao`**

| Campo Esperado | Campo Real | Correção |
|---------------|------------|----------|
| `user_id` | ❌ Não existe | ✅ Usar `usuario_id` |
| `detalhes` (TEXT) | ❌ Incorreto | ✅ É JSONB |
| Referência `users` | ❌ Não existe | ✅ Referenciar `usuarios` |

---

## ✅ Correções Implementadas

### **1. Queries (`lib/db/queries/carregamentos.ts`)**

#### **`listCarregamentos()`**
- ✅ Adicionado JOIN com `vendas` para buscar `cliente_nome` e `contrato_codigo`
- ✅ Campo `produto_nome` agora usa `detalhes_produto`
- ✅ Campo `liquido_kg` calculado: `(peso_final_total - tara_total) * 1000`
- ✅ Filtro de cliente agora usa `v.nome_cliente`
- ✅ Filtro de contrato agora usa `v.codigo`
- ✅ COUNT query também faz JOIN com `vendas`

#### **`getCarregamentoById()`**
- ✅ Adicionado JOIN com `vendas`
- ✅ Conversão de `tara_eixos` e `peso_final_eixos` de array JSONB para objeto numerado
- ✅ Campos mapeados corretamente para o formato esperado pelo frontend

#### **`finalizarCarregamento()`**
- ✅ Status atualizado para `'concluido'` (não `'finalizado'`)
- ✅ Usa `peso_final_total` (em TON) ao invés de `bruto_kg`
- ✅ Usa `peso_final_eixos` (JSONB array) ao invés de `final_eixos_kg`
- ✅ Verifica status `'stand-by'` (não `'standby'`)

#### **`createCarregamento()`**
- ✅ Agora requer `venda_id` (obrigatório)
- ✅ Usa `detalhes_produto` ao invés de `produto_nome`
- ✅ Usa `qtd_desejada` (TEXT) ao invés de `qtd_desejada_ton`
- ✅ Usa `tara_total` (em TON) ao invés de `tara_kg`
- ✅ Usa `tara_eixos` (JSONB array) ao invés de `tara_eixos_kg`
- ✅ Status padrão: `'stand-by'`

#### **`cancelarCarregamento()`**
- ✅ Verifica status `'stand-by'` e `'concluido'` (não `'standby'` e `'finalizado'`)

### **2. Dashboard (`lib/db/queries/dashboard.ts`)**

- ✅ Status `'standby'` → `'stand-by'`
- ✅ Status `'finalizado'` → `'concluido'`
- ✅ Comparação de data usando `CAST(data_carregamento AS DATE)`
- ✅ JOIN com `usuarios` (não `users`)

### **3. Relatórios (`lib/db/queries/relatorios.ts`)**

- ✅ JOIN com `vendas` para buscar `cliente_nome`
- ✅ Status `'finalizado'` → `'concluido'`
- ✅ Campo `liquido_kg` calculado: `(peso_final_total - tara_total) * 1000`
- ✅ Comparação de data usando `CAST(data_carregamento AS DATE)`

### **4. Frontend (`app/(app)/pesagem/page.tsx`)**

- ✅ Compatibilidade com ambos `'stand-by'` e `'standby'`
- ✅ Compatibilidade com ambos `'concluido'` e `'finalizado'`
- ✅ Filtro de busca atualizado para aceitar ambos formatos

### **5. Utilitários (`lib/utils/status.ts`)**

- ✅ `formatStatus()` aceita ambos formatos (`'stand-by'` e `'standby'`, `'concluido'` e `'finalizado'`)
- ✅ `getStatusBadgeVariant()` aceita ambos formatos

### **6. Validators (`lib/validators/`)**

- ✅ `CarregamentoStatusEnum` atualizado para incluir ambos formatos
- ✅ `FinalizarResponseSchema` aceita `'concluido'` e `'finalizado'`

### **7. API Routes**

- ✅ `app/api/carregamentos/[id]/finalizar/route.ts` verifica ambos formatos de status

### **8. Seed (`lib/db/migrations/003_seed_fake_data.sql`)**

- ✅ Adicionadas transportadoras fake
- ✅ Adicionados motoristas fake
- ✅ Adicionadas vendas/contratos fake
- ✅ Adicionados produtos_venda fake
- ✅ Carregamentos usam campos corretos:
  - `venda_id` (obrigatório)
  - `tara_total` (em TON)
  - `peso_final_total` (em TON)
  - `tara_eixos` (JSONB array)
  - `peso_final_eixos` (JSONB array)
  - `qtd_desejada` (TEXT)
  - `detalhes_produto` (TEXT)
  - Status: `'stand-by'` ou `'concluido'`
- ✅ Logs usam `usuario_id` e `detalhes` como JSONB
- ✅ Notificações verificam se tabela existe antes de inserir

---

## 🔄 Conversões de Dados

### **Pesos**

| Origem | Destino | Fórmula |
|--------|---------|---------|
| kg (entrada) | TON (banco) | `TON = kg / 1000` |
| TON (banco) | kg (exibição) | `kg = TON * 1000` |
| Array JSONB | Objeto numerado | `{1: arr[0], 2: arr[1], ...}` |
| Objeto numerado | Array JSONB | `[obj[1], obj[2], ...]` |

### **Eixos (JSONB)**

**Formato no banco:**
```json
[8500, 8200, 8300]
```

**Formato esperado pelo frontend:**
```json
{"1": 8500, "2": 8200, "3": 8300}
```

**Conversão:**
- Banco → Frontend: Iterar array e criar objeto com índices 1-based
- Frontend → Banco: Converter objeto para array ordenado

---

## 📊 Status do Sistema

### **Status Válidos no Schema Real**

| Status | Descrição | Uso |
|--------|-----------|-----|
| `'pendente'` | Carregamento pendente | Inicial |
| `'stand-by'` | Em espera (tara registrada) | Aguardando pesagem final |
| `'concluido'` | Finalizado | Pesagem completa |
| `'cancelado'` | Cancelado | Cancelado |

### **Compatibilidade**

O código agora aceita ambos formatos para compatibilidade:
- `'stand-by'` e `'standby'` → Ambos funcionam
- `'concluido'` e `'finalizado'` → Ambos funcionam

---

## 🧪 Testes Necessários

1. ✅ Listar carregamentos do dia atual
2. ✅ Buscar carregamentos por cliente
3. ✅ Buscar carregamentos por placa
4. ✅ Buscar carregamentos por contrato
5. ✅ Criar novo carregamento em stand-by
6. ✅ Finalizar carregamento (stand-by → concluido)
7. ✅ Cancelar carregamento
8. ✅ Dashboard KPIs atualizados
9. ✅ Relatórios funcionando
10. ✅ Pesagem com eixos (1-5)

---

## ⚠️ Pontos de Atenção

1. **Conversão TON ↔ kg:**
   - Sempre verificar se a conversão está correta
   - Banco armazena em TON (numeric 12,3)
   - Frontend trabalha com kg para cálculos

2. **Eixos JSONB:**
   - Banco usa array: `[8500, 8200, 8300]`
   - Frontend espera objeto: `{1: 8500, 2: 8200, 3: 8300}`
   - Conversão necessária em `getCarregamentoById()`

3. **JOINs Obrigatórios:**
   - `cliente_nome` e `contrato_codigo` vêm de `vendas`
   - Sempre fazer JOIN com `vendas` ao buscar carregamentos

4. **Status:**
   - Schema real usa `'stand-by'` (com hífen) e `'concluido'` (sem acento)
   - Código mantém compatibilidade com ambos formatos

5. **venda_id:**
   - É obrigatório na tabela `carregamentos`
   - Deve referenciar `vendas.id_gc`

---

## 📝 Próximos Passos

1. ✅ Executar migração 004 (Appsmith Schema Alignment)
2. ✅ Executar seed atualizado
3. ✅ Testar listagem de carregamentos
4. ✅ Testar criação de carregamento
5. ✅ Testar finalização de carregamento
6. ✅ Verificar dashboard
7. ✅ Verificar relatórios

---

**Última atualização:** 2024-01-15

