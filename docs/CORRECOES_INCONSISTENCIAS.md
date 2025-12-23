# Correções de Inconsistências - Usuários e Status

Este documento lista todas as correções realizadas para padronizar:
1. Nomes de tabelas e campos (`users` vs `usuarios`, `user_id` vs `usuario_id`)
2. Status de carregamentos (`standby` vs `stand-by`, `finalizado` vs `concluido`)

## Padrões Definidos

### Tabelas e Campos
- ✅ **Tabela de usuários**: `users` (não `usuarios`)
- ✅ **Campo de usuário em logs**: `user_id` (não `usuario_id`)
- ✅ **Campo de nome**: `name` (não `nome`)

### Status de Carregamentos
- ✅ **Status padrão**: `standby` (não `stand-by` ou `pendente`)
- ✅ **Status finalizado**: `finalizado` (não `concluido`)
- ✅ **Status cancelado**: `cancelado`

**Nota**: O código ainda aceita variações antigas (`stand-by`, `concluido`) para compatibilidade com dados existentes, mas novos dados devem usar os padrões acima.

## Correções Realizadas

### 1. Seed de Dados (003_seed_fake_data.sql)
- ✅ Corrigido `usuarios` → `users`
- ✅ Corrigido `usuario_id` → `user_id`
- ✅ Atualizado comentário sobre campo correto

### 2. Queries de Logs (lib/db/queries/logs.ts)
- ✅ Corrigido `LEFT JOIN usuarios` → `LEFT JOIN users`
- ✅ Corrigido `u.nome` → `u.name`
- ✅ Corrigido `l.usuario_id` → `l.user_id`
- ✅ Corrigido `INSERT INTO logs_acao (..., usuario_id)` → `user_id`

### 3. Queries de Carregamentos (lib/db/queries/carregamentos.ts)
- ✅ Corrigido `status = 'concluido'` → `status = 'finalizado'`
- ✅ Corrigido `status = 'stand-by'` → `status = 'standby'`
- ✅ Corrigido `status IN ('stand-by', 'concluido')` → `status IN ('standby', 'finalizado')`
- ✅ Corrigido valor padrão `'pendente'` → `'standby'`

### 4. Queries de Relatórios (lib/db/queries/relatorios.ts)
- ✅ Corrigido `c.status = 'concluido'` → `c.status = 'finalizado'`

### 5. API de Finalização (app/api/carregamentos/[id]/finalizar/route.ts)
- ✅ Simplificado verificação de status para usar apenas `standby`

### 6. Dashboard (lib/db/queries/dashboard.ts)
- ✅ Mantido suporte a ambos `standby` e `stand-by` para compatibilidade
- ✅ Mantido suporte a ambos `finalizado` e `concluido` para compatibilidade

## Frontend - Compatibilidade

O frontend ainda aceita variações antigas para compatibilidade:
- `stand-by` e `standby` são ambos aceitos
- `concluido` e `finalizado` são ambos aceitos

Isso permite que dados antigos continuem funcionando enquanto novos dados usam os padrões corretos.

## Validações

O validador `CarregamentoStatusEnum` aceita ambos para compatibilidade:
```typescript
export const CarregamentoStatusEnum = z.enum([
  "pendente", "stand-by", "concluido", "cancelado", 
  "standby", "finalizado"
]);
```

## Migração de Dados Existentes

Se houver dados antigos no banco com status incorretos, execute:

```sql
-- Corrigir status de carregamentos
UPDATE carregamentos 
SET status = 'standby' 
WHERE status = 'stand-by';

UPDATE carregamentos 
SET status = 'finalizado' 
WHERE status = 'concluido';
```

## Verificação

Para verificar se há dados com status antigos:

```sql
SELECT status, COUNT(*) 
FROM carregamentos 
WHERE status IN ('stand-by', 'concluido', 'pendente')
GROUP BY status;
```

