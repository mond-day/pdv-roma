#!/bin/bash
#
# Script de Backup Automático - PDV Roma
# Executa backup diário do PostgreSQL e mantém retenção de 30 dias
#
# Instalação:
# 1. Copiar para /opt/scripts/backup-pdv.sh
# 2. chmod +x /opt/scripts/backup-pdv.sh
# 3. Adicionar ao crontab: crontab -e
#    0 2 * * * /opt/scripts/backup-pdv.sh >> /var/log/backup-pdv.log 2>&1
#

set -e  # Parar em caso de erro

# ==========================================
# CONFIGURAÇÕES (Ajustar conforme ambiente)
# ==========================================

# Banco de dados
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-pdv_roma}"
DB_USER="${DB_USER:-postgres}"

# Diretórios
BACKUP_DIR="${BACKUP_DIR:-/var/backups/pdv-roma}"
LOG_FILE="${LOG_FILE:-/var/log/backup-pdv.log}"

# Retenção (em dias)
RETENTION_DAYS=30

# N8N Webhook (opcional - para notificar sobre backups)
N8N_WEBHOOK_URL="${N8N_WEBHOOK_URL:-}"

# ==========================================
# FUNÇÕES
# ==========================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    log "❌ ERRO: $1"
    exit 1
}

success() {
    log "✅ $1"
}

# ==========================================
# VALIDAÇÕES
# ==========================================

log "=== Iniciando backup do PDV Roma ==="

# Verificar se pg_dump existe
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump não encontrado. Instale PostgreSQL client."
fi

# Criar diretório de backup se não existir
if [ ! -d "$BACKUP_DIR" ]; then
    log "Criando diretório de backup: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR" || error "Falha ao criar diretório de backup"
fi

# ==========================================
# BACKUP
# ==========================================

# Nome do arquivo com timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pdv_roma_$TIMESTAMP.sql.gz"

log "Iniciando dump do banco de dados..."
log "Host: $DB_HOST:$DB_PORT | Database: $DB_NAME"

# Executar pg_dump com compressão
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    success "Backup criado: $BACKUP_FILE ($BACKUP_SIZE)"
else
    error "Falha ao criar backup do banco de dados"
fi

# ==========================================
# LIMPEZA (Retenção de 30 dias)
# ==========================================

log "Removendo backups antigos (>${RETENTION_DAYS} dias)..."

# Contar arquivos antes
BEFORE_COUNT=$(find "$BACKUP_DIR" -name "pdv_roma_*.sql.gz" -type f | wc -l)

# Remover arquivos mais antigos que RETENTION_DAYS
find "$BACKUP_DIR" -name "pdv_roma_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Contar arquivos depois
AFTER_COUNT=$(find "$BACKUP_DIR" -name "pdv_roma_*.sql.gz" -type f | wc -l)
REMOVED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))

if [ $REMOVED_COUNT -gt 0 ]; then
    log "Removidos $REMOVED_COUNT backup(s) antigo(s)"
else
    log "Nenhum backup antigo para remover"
fi

log "Total de backups mantidos: $AFTER_COUNT"

# ==========================================
# NOTIFICAÇÃO (Opcional via N8N)
# ==========================================

if [ -n "$N8N_WEBHOOK_URL" ]; then
    log "Enviando notificação via N8N webhook..."

    PAYLOAD=$(cat <<EOF
{
  "tipo": "backup_success",
  "timestamp": "$TIMESTAMP",
  "arquivo": "$BACKUP_FILE",
  "tamanho": "$BACKUP_SIZE",
  "total_backups": $AFTER_COUNT,
  "removidos": $REMOVED_COUNT
}
EOF
    )

    if curl -s -X POST "$N8N_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" > /dev/null; then
        log "Notificação enviada com sucesso"
    else
        log "⚠️  Falha ao enviar notificação (backup foi criado normalmente)"
    fi
fi

# ==========================================
# FINALIZAÇÃO
# ==========================================

log "=== Backup concluído com sucesso ==="
log "Arquivo: $BACKUP_FILE"
log "Tamanho: $BACKUP_SIZE"
log ""
log "📌 PRÓXIMOS PASSOS:"
log "1. Configure workflow N8N para enviar este arquivo ao Google Drive"
log "2. Monitore o log em: $LOG_FILE"
log "3. Teste restauração: gunzip -c $BACKUP_FILE | psql -U $DB_USER $DB_NAME"
log ""

exit 0
