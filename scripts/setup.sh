#!/bin/bash

# PDV Roma - Setup Automático
# Este script configura o projeto PDV Roma automaticamente

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PDV ROMA - SETUP AUTOMÁTICO${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Função para printar mensagens de sucesso
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Função para printar mensagens de erro
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Função para printar mensagens de aviso
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Função para printar mensagens de info
info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado!"
    error "Execute este script na raiz do projeto PDV Roma"
    exit 1
fi

success "Diretório do projeto: $(pwd)"
echo ""

# 1. Verificar Node.js
info "[1/7] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
    error "Instale Node.js 18+ de https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versão 18+ é necessária (atual: $(node -v))"
    exit 1
fi

success "Node.js $(node -v) encontrado"
echo ""

# 2. Verificar PostgreSQL
info "[2/7] Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    error "PostgreSQL (psql) não está instalado"
    error "Instale PostgreSQL 13+ de https://www.postgresql.org/"
    exit 1
fi

success "PostgreSQL $(psql --version | cut -d' ' -f3) encontrado"
echo ""

# 3. Instalar dependências
info "[3/7] Instalando dependências npm..."
npm install
success "Dependências instaladas"
echo ""

# 4. Configurar .env.local
info "[4/7] Configurando variáveis de ambiente..."
if [ -f ".env.local" ]; then
    warning ".env.local já existe, pulando..."
else
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        success ".env.local criado a partir de .env.example"

        # Gerar JWT_SECRET
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -base64 32)
            # Atualizar JWT_SECRET no .env.local
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.local
            else
                # Linux
                sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.local
            fi
            success "JWT_SECRET gerado e configurado"
        else
            warning "openssl não encontrado, configure JWT_SECRET manualmente em .env.local"
        fi
    else
        warning ".env.example não encontrado, criando .env.local básico..."
        cat > .env.local << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pdv_roma

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "CHANGE_ME_TO_A_SECURE_RANDOM_STRING")

# Optional: N8N Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/pdv-roma
N8N_TOKEN=

# SMTP (opcional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Integrations (opcional)
NIBO_TOKEN=
GC_TOKEN=
EOF
        success ".env.local criado com valores padrão"
    fi
fi

warning "IMPORTANTE: Configure DATABASE_URL em .env.local com suas credenciais PostgreSQL"
echo ""

# 5. Solicitar credenciais do banco
info "[5/7] Configuração do banco de dados..."
read -p "Usuário PostgreSQL (padrão: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Senha PostgreSQL: " DB_PASS
echo ""

read -p "Nome do banco (padrão: pdv_roma): " DB_NAME
DB_NAME=${DB_NAME:-pdv_roma}

read -p "Host do banco (padrão: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Porta do banco (padrão: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Atualizar DATABASE_URL no .env.local
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env.local
else
    # Linux
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env.local
fi

success "DATABASE_URL configurado"
echo ""

# 6. Criar banco de dados e executar migrations
info "[6/7] Criando banco de dados e executando migrations..."

# Criar banco se não existir
PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -lqt | cut -d \| -f 1 | grep -qw $DB_NAME
if [ $? -eq 0 ]; then
    warning "Banco de dados $DB_NAME já existe"
else
    PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"
    success "Banco de dados $DB_NAME criado"
fi

# Executar migrations
info "Executando migrations..."
MIGRATIONS=(
    "001_init.sql"
    "002_logs_immutable.sql"
    "004_appsmith_schema_alignment.sql"
    "005_fix_encoding_notificacoes.sql"
    "006_fix_encoding_notificacoes_v2.sql"
    "007_normalizar_status_carregamentos.sql"
)

for MIGRATION in "${MIGRATIONS[@]}"; do
    if [ -f "lib/db/migrations/$MIGRATION" ]; then
        info "  → Executando $MIGRATION..."
        PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "lib/db/migrations/$MIGRATION" > /dev/null 2>&1
        success "  ✓ $MIGRATION"
    else
        warning "  ⚠ $MIGRATION não encontrado, pulando..."
    fi
done

success "Migrations executadas"
echo ""

# 7. Executar seed (opcional)
info "[7/7] Dados fake (seed)..."
read -p "Deseja carregar dados fake para testes? (s/N): " LOAD_SEED
if [[ "$LOAD_SEED" =~ ^[Ss]$ ]]; then
    if [ -f "lib/db/migrations/003_seed_fake_data.sql" ]; then
        PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "lib/db/migrations/003_seed_fake_data.sql"
        success "Seed executado com sucesso"
    else
        error "003_seed_fake_data.sql não encontrado"
    fi
else
    warning "Seed pulado"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   SETUP CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
success "Projeto configurado e pronto para uso!"
echo ""
info "Próximos passos:"
echo "  1. Revisar configurações em .env.local"
echo "  2. Executar: npm run dev"
echo "  3. Acessar: http://localhost:3000"
echo "  4. Login: admin@pdv.com / admin123"
echo ""
info "Documentação:"
echo "  - docs/QUICK_SETUP.md"
echo "  - docs/PROCESSO_PESAGEM.md"
echo "  - docs/IMPROVEMENTS-ROADMAP.md"
echo ""
