# 🎯 Estratégia de Ambiente de Staging

## 📋 Visão Geral

**Decisão (Q12-A, Q13):** Ambiente de staging **CRÍTICO** com **banco separado** (clone de produção semanal)

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│   PRODUÇÃO      │
│  pdv-roma-prod  │
│  Port: 3000     │
│  DB: pdv_roma   │
└────────┬────────┘
         │
         │ Clone semanal
         │ (pg_dump)
         ↓
┌─────────────────┐
│   STAGING       │
│  pdv-roma-stage │
│  Port: 3001     │
│  DB: pdv_staging│
└─────────────────┘
         │
         │ Deploy automático
         │ (branch: staging)
         ↓
     Testes QA
```

---

## 🔧 Configuração do Staging

### 1. Banco de Dados Staging

```bash
# Criar banco de staging
createdb -U postgres pdv_staging

# Script de clone semanal (executar via cron: Sábados às 3h AM)
#!/bin/bash
# /opt/scripts/clone-prod-to-staging.sh

echo "[$(date)] Iniciando clone de produção para staging..."

# Backup da produção
pg_dump -U postgres pdv_roma > /tmp/prod-backup.sql

# Restaurar no staging
dropdb -U postgres pdv_staging --if-exists
createdb -U postgres pdv_staging
psql -U postgres pdv_staging < /tmp/prod-backup.sql

# Anonimizar dados sensíveis
psql -U postgres pdv_staging <<EOF
-- Anonimizar emails
UPDATE users SET email = 'user' || id || '@staging.test';

-- Anonimizar telefones
UPDATE transportadoras SET telefone = '(99) 9999-9999';
UPDATE motoristas SET cpf = '000.000.000-00';

-- Resetar webhooks para não enviar para produção
UPDATE webhooks_config SET
  busca_placa = 'https://staging.romamineracao.com.br/webhook/busca-placa',
  busca_codigo = 'https://staging.romamineracao.com.br/webhook/busca-codigo',
  confirmacao = 'https://staging.romamineracao.com.br/webhook/confirmacao',
  cancelamento = 'https://staging.romamineracao.com.br/webhook/cancelamento',
  ticket = 'https://staging.romamineracao.com.br/webhook/ticket',
  duplicacao = 'https://staging.romamineracao.com.br/webhook/duplicacao';
EOF

echo "[$(date)] Clone concluído!"
rm /tmp/prod-backup.sql
```

### 2. Docker Compose Staging

Criar `docker-compose.staging.yml`:

```yaml
version: '3.8'

services:
  pdv-staging:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pdv-roma-staging
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db-staging:5432/pdv_staging
      - JWT_SECRET=${JWT_SECRET_STAGING}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY_STAGING}
      - PORT=3001
    ports:
      - "3001:3000"
    depends_on:
      - db-staging
    restart: unless-stopped
    networks:
      - pdv-staging-network

  db-staging:
    image: postgres:15-alpine
    container_name: pdv-db-staging
    environment:
      - POSTGRES_DB=pdv_staging
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - pdv-staging-data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - pdv-staging-network

networks:
  pdv-staging-network:
    driver: bridge

volumes:
  pdv-staging-data:
```

### 3. Variáveis de Ambiente Staging

Criar `.env.staging`:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5433/pdv_staging

# App
NODE_ENV=staging
PORT=3001

# Security
JWT_SECRET=staging-jwt-secret-change-me
ENCRYPTION_KEY=staging-encryption-key-change-me

# Webhooks (apontar para endpoints de teste)
N8N_WEBHOOK_URL=https://staging-n8n.romamineracao.com.br
GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/v1/spaces/STAGING_SPACE/messages

# SMTP (usar servidor de teste - Mailtrap, MailHog, etc)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=staging_user
SMTP_PASS=staging_password
```

---

## 🚀 Deploy Automático

### GitHub Actions Workflow

Criar `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to staging server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/pdv-roma-staging
            git pull origin staging
            docker-compose -f docker-compose.staging.yml down
            docker-compose -f docker-compose.staging.yml up -d --build
            docker-compose -f docker-compose.staging.yml logs -f --tail=50

      - name: Notify deployment
        if: success()
        run: |
          curl -X POST ${{ secrets.GOOGLE_CHAT_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "✅ Deploy staging concluído! Commit: ${{ github.sha }}"
            }'
```

---

## 📝 Fluxo de Trabalho

### 1. Desenvolvimento Local

```bash
# Trabalhar em feature branch
git checkout -b feature/nova-funcionalidade
# Desenvolver...
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 2. Merge para Staging

```bash
# Após aprovação do PR
git checkout staging
git merge feature/nova-funcionalidade
git push origin staging

# GitHub Actions faz deploy automático para staging
```

### 3. Teste em Staging

```
1. QA testa funcionalidade em https://staging.romamineracao.com.br
2. Verifica logs e erros
3. Valida integrações
4. Aprova ou rejeita
```

### 4. Merge para Produção

```bash
# Após aprovação em staging
git checkout main
git merge staging
git push origin main

# Deploy para produção (manual ou automático)
```

---

## ✅ Checklist de Staging

### Infraestrutura
- [ ] Servidor staging provisionado
- [ ] Docker + Docker Compose instalados
- [ ] Banco PostgreSQL staging criado
- [ ] Secrets configurados (.env.staging)
- [ ] Cron job de clone semanal configurado
- [ ] Firewall configurado (portas 3001, 5433)

### Código
- [ ] Branch `staging` criada
- [ ] GitHub Actions workflow configurado
- [ ] docker-compose.staging.yml criado
- [ ] Scripts de anonimização testados

### Processo
- [ ] Documentação de acesso distribuída
- [ ] Credenciais de staging criadas
- [ ] Workflow de QA definido
- [ ] Procedimento de rollback documentado

---

## 🔐 Anonimização de Dados

**CRÍTICO:** Staging usa dados de produção, mas com informações sensíveis anonimizadas.

```sql
-- Script executado após cada clone

-- Usuários
UPDATE users
SET
  email = 'user' || id || '@staging.test',
  password_hash = '$2a$10$staging.hash'; -- senha: staging123

-- Motoristas
UPDATE motoristas
SET
  cpf = '000.000.000-' || LPAD(id::text, 2, '0');

-- Transportadoras
UPDATE transportadoras
SET
  cpf_cnpj = CASE
    WHEN tipo_pessoa = 'PF' THEN '000.000.000-00'
    ELSE '00.000.000/0001-00'
  END,
  email = 'transportadora' || id || '@staging.test',
  telefone = '(99) 9999-9999';

-- Webhooks
UPDATE webhooks_config
SET
  busca_placa = 'https://staging.test/webhook/busca-placa',
  busca_codigo = 'https://staging.test/webhook/busca-codigo',
  confirmacao = 'https://staging.test/webhook/confirmacao',
  cancelamento = 'https://staging.test/webhook/cancelamento',
  ticket = 'https://staging.test/webhook/ticket',
  duplicacao = 'https://staging.test/webhook/duplicacao';
```

---

## 📊 Monitoramento de Staging

```bash
# Logs em tempo real
docker-compose -f docker-compose.staging.yml logs -f

# Status dos containers
docker-compose -f docker-compose.staging.yml ps

# Uso de recursos
docker stats pdv-roma-staging

# Verificar health
curl https://staging.romamineracao.com.br/api/health
```

---

## 🔄 Sincronização de Dados

**Frequência:** Semanal (Sábados às 3h AM)

**Cron:**
```cron
0 3 * * 6 /opt/scripts/clone-prod-to-staging.sh >> /var/log/clone-staging.log 2>&1
```

**Notificação:**
```bash
# Ao final do script
curl -X POST $GOOGLE_CHAT_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d "{
    \"text\": \"✅ Banco staging sincronizado com produção ($(date))\"
  }"
```

---

## ⚠️ Importante

1. **NUNCA** usar staging para dados reais/sensíveis
2. **SEMPRE** anonimizar dados após clone
3. **NUNCA** apontar webhooks de staging para prod
4. **SEMPRE** testar em staging antes de produção
5. **NUNCA** fazer deploy direto para prod sem passar por staging

---

**Criado por:** Claude Code Agent
**Data:** 2025-12-24
**Status:** ✅ Pronto para implementação
