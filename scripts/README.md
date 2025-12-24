# Scripts de Banco de Dados

Esta pasta contém scripts para gerenciar o banco de dados do PDV Roma.

## Scripts Disponíveis

### 1. executar-todas-migracoes.cmd
**Executa TODAS as migrations do projeto (001 até 009)**

```cmd
scripts\executar-todas-migracoes.cmd
```

Este script executa na ordem:
1. Migration 001: Inicialização do banco
2. Migration 002: Logs imutáveis
3. Migration 003: Seed de dados fake
4. Migration 004: Alinhamento com schema Appsmith
5. Migration 005: Fix de encoding UTF-8
6. Migration 006: Fix de encoding V2
7. Migration 007: Normalização de status
8. Migration 008: Alinhamento com schema real
9. Migration 009: **Correção de schema (IDEMPOTENTE)**

### 2. executar-seed.cmd
**Executa apenas o seed de dados fake**

```cmd
scripts\executar-seed.cmd
```

Use quando quiser repovoar o banco com dados de teste sem rodar todas as migrations.

## Ordem de Execução Recomendada

Para configurar o banco do zero:

```cmd
# 1. Executar todas as migrations
scripts\executar-todas-migracoes.cmd

# 2. Executar seed (se não foi incluído nas migrations)
scripts\executar-seed.cmd

# 3. Reiniciar o servidor
npm run dev
```

## Migration 009 - Correção Importante

A migration 009 é **idempotente** e corrige problemas das migrations anteriores:
- Adiciona colunas faltantes (`tara_total`, `peso_final_total`, `qtd_desejada`, `detalhes_produto`)
- Renomeia colunas antigas (`tara_eixos_kg` → `tara_eixos`, `final_eixos_kg` → `peso_final_eixos`)
- Adiciona colunas em tabelas relacionadas (motoristas, transportadoras, produtos_venda)
- Pode ser executada múltiplas vezes sem causar erros

## Solução de Problemas

### Erro: "coluna X já existe"
Execute a migration 009 que é idempotente e resolve esses conflitos.

### Erro: "não existe a coluna X"
Execute todas as migrations na ordem usando `executar-todas-migracoes.cmd`.

### Seed falha com erro de colunas
1. Execute `executar-todas-migracoes.cmd` primeiro
2. Depois execute `executar-seed.cmd` novamente
