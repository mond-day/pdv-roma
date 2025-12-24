# 🔄 Configuração de Backups Automáticos

## 📋 Visão Geral

Sistema de backup diário automático do PostgreSQL com:
- **Frequência:** Diário às 2h AM
- **Retenção:** 30 dias
- **Localização:** `/var/backups/pdv-roma/`
- **Formato:** SQL comprimido (.sql.gz)
- **Notificação:** N8N webhook → Google Drive (workflow externo)

---

## 🚀 Instalação

### 1. Copiar Script

```bash
# No servidor de produção
sudo mkdir -p /opt/scripts
sudo cp scripts/backup-pdv.sh /opt/scripts/
sudo chmod +x /opt/scripts/backup-pdv.sh
```

### 2. Criar Diretório de Backups

```bash
sudo mkdir -p /var/backups/pdv-roma
sudo chown postgres:postgres /var/backups/pdv-roma
sudo chmod 750 /var/backups/pdv-roma
```

### 3. Configurar Variáveis de Ambiente

Criar `/opt/scripts/.env-backup`:

```bash
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pdv_roma
DB_USER=postgres

# Diretórios
BACKUP_DIR=/var/backups/pdv-roma
LOG_FILE=/var/log/backup-pdv.log

# N8N Webhook (opcional - para notificar)
N8N_WEBHOOK_URL=https://n8n.romamineracao.com.br/webhook/backup-notify
```

### 4. Configurar Cron Job

```bash
sudo crontab -e
```

Adicionar linha:

```cron
# Backup PDV Roma - Diário às 2h AM
0 2 * * * source /opt/scripts/.env-backup && /opt/scripts/backup-pdv.sh >> /var/log/backup-pdv.log 2>&1
```

### 5. Testar Execução Manual

```bash
# Executar backup manualmente
sudo /opt/scripts/backup-pdv.sh

# Verificar se arquivo foi criado
ls -lh /var/backups/pdv-roma/

# Ver log
tail -f /var/log/backup-pdv.log
```

---

## 📤 Workflow N8N para Google Drive

### Criar Workflow no N8N:

1. **Trigger:** Webhook
   - URL: `https://n8n.romamineracao.com.br/webhook/backup-notify`
   - Method: POST

2. **Node 1: Read File**
   - File Path: `{{ $json.arquivo }}`
   - Binary Property: `data`

3. **Node 2: Google Drive Upload**
   - File: Use Binary Data (`data`)
   - Folder ID: `<ID da pasta no Google Drive>`
   - File Name: `pdv_backup_{{ $json.timestamp }}.sql.gz`

4. **Node 3: Send Email** (opcional)
   - To: `admin@romamineracao.com.br`
   - Subject: `✅ Backup PDV Roma - {{ $json.timestamp }}`
   - Body:
     ```
     Backup realizado com sucesso:

     Arquivo: {{ $json.arquivo }}
     Tamanho: {{ $json.tamanho }}
     Total de backups: {{ $json.total_backups }}
     Removidos: {{ $json.removidos }}

     Arquivo enviado ao Google Drive.
     ```

---

## 🔄 Restauração de Backup

### Restaurar Backup Completo

```bash
# 1. Parar aplicação
docker-compose down

# 2. Dropar banco existente (CUIDADO!)
dropdb -U postgres pdv_roma

# 3. Criar banco novo
createdb -U postgres pdv_roma

# 4. Restaurar backup
gunzip -c /var/backups/pdv-roma/pdv_roma_20251224_020000.sql.gz | \
  psql -U postgres pdv_roma

# 5. Reiniciar aplicação
docker-compose up -d
```

### Restaurar Apenas Uma Tabela

```bash
# Extrair apenas estrutura de uma tabela
gunzip -c /var/backups/pdv-roma/pdv_roma_20251224_020000.sql.gz | \
  sed -n '/CREATE TABLE carregamentos/,/;/p' | \
  psql -U postgres pdv_roma
```

---

## 📊 Monitoramento

### Verificar Backups Recentes

```bash
# Listar últimos 10 backups
ls -lht /var/backups/pdv-roma/ | head -11

# Contar total de backups
find /var/backups/pdv-roma -name "*.sql.gz" | wc -l
```

### Verificar Tamanho Total

```bash
du -sh /var/backups/pdv-roma/
```

### Ver Log de Execuções

```bash
# Ver últimas execuções
tail -100 /var/log/backup-pdv.log

# Ver apenas erros
grep "❌ ERRO" /var/log/backup-pdv.log

# Ver apenas sucessos
grep "✅" /var/log/backup-pdv.log
```

---

## ⚠️ Troubleshooting

### Problema: "pg_dump: authentication failed"

**Solução:**
```bash
# Configurar autenticação sem senha
echo "localhost:5432:pdv_roma:postgres:SUA_SENHA" > ~/.pgpass
chmod 600 ~/.pgpass
```

### Problema: "Permission denied"

**Solução:**
```bash
# Ajustar permissões
sudo chown postgres:postgres /var/backups/pdv-roma
sudo chmod 750 /var/backups/pdv-roma
```

### Problema: "Disk quota exceeded"

**Solução:**
```bash
# Liberar espaço removendo backups antigos manualmente
find /var/backups/pdv-roma -name "*.sql.gz" -mtime +15 -delete
```

---

## 📈 Estimativa de Espaço

**Cálculo:**
```
Tamanho médio do backup: ~50 MB comprimido
Retenção: 30 dias
Espaço necessário: 50 MB × 30 = ~1.5 GB
```

**Recomendação:** Mínimo 5 GB livres em `/var/backups/`

---

## 🔐 Segurança

1. **Backups são criptografados?**
   - Não por padrão
   - Implementar criptografia (opcional):
     ```bash
     pg_dump ... | gzip | gpg --encrypt --recipient admin@romamineracao.com.br > backup.sql.gz.gpg
     ```

2. **Quem pode acessar backups?**
   - Apenas usuário `postgres` e `root`
   - Permissões: `750` (owner: rwx, group: r-x, others: ---)

3. **Backups offsite?**
   - Sim, via N8N → Google Drive
   - Configurar 3-2-1 rule: 3 cópias, 2 mídias diferentes, 1 offsite

---

## ✅ Checklist de Configuração

- [ ] Script copiado para `/opt/scripts/backup-pdv.sh`
- [ ] Permissões configuradas (`chmod +x`)
- [ ] Diretório `/var/backups/pdv-roma` criado
- [ ] Variáveis de ambiente configuradas (`.env-backup`)
- [ ] Cron job adicionado (2h AM diário)
- [ ] Teste manual executado com sucesso
- [ ] Workflow N8N criado e testado
- [ ] Notificação por email configurada
- [ ] Teste de restauração realizado
- [ ] Monitoramento configurado (alertas)

---

**Criado por:** Claude Code Agent
**Data:** 2025-12-24
**Status:** ✅ Pronto para uso
