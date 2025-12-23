# 🚀 PDV Roma - Guia de Setup Rápido

**Última atualização:** 2025-12-23

Este guia fornece comandos rápidos para configurar e executar o projeto PDV Roma após clonar o repositório.

---

## 📋 Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))

---

## 🎯 Setup Rápido (5 minutos)

### 1️⃣ **Clonar Repositório**

```bash
git clone https://github.com/mond-day/pdv-roma.git
cd pdv-roma
```

### 2️⃣ **Instalar Dependências**

```bash
npm install
```

### 3️⃣ **Configurar Banco de Dados**

#### **Criar banco de dados:**
```bash
# Linux/Mac (usando psql)
psql -U postgres -c "CREATE DATABASE pdv_roma;"

# Windows (PowerShell)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE pdv_roma;"
```

#### **Executar migrations:**
```bash
# Linux/Mac
psql -U postgres -d pdv_roma -f lib/db/migrations/001_init.sql
psql -U postgres -d pdv_roma -f lib/db/migrations/002_logs_immutable.sql
psql -U postgres -d pdv_roma -f lib/db/migrations/004_appsmith_schema_alignment.sql
psql -U postgres -d pdv_roma -f lib/db/migrations/005_fix_encoding_notificacoes.sql
psql -U postgres -d pdv_roma -f lib/db/migrations/006_fix_encoding_notificacoes_v2.sql
psql -U postgres -d pdv_roma -f lib/db/migrations/007_normalizar_status_carregamentos.sql

# Windows (via script automatizado)
.\scripts\executar-todas-migracoes.cmd
```

#### **Executar seed (dados fake):**
```bash
# Linux/Mac
psql -U postgres -d pdv_roma -f lib/db/migrations/003_seed_fake_data.sql

# Windows
.\scripts\executar-seed.cmd
```

### 4️⃣ **Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copiar template
cp .env.example .env.local
```

**Conteúdo mínimo do `.env.local`:**
```env
# Database
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/pdv_roma

# JWT Secret (gere um aleatório)
JWT_SECRET=sua_chave_secreta_super_segura_aqui

# Optional: N8N Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/pdv-roma
N8N_TOKEN=seu_token_n8n
```

**Gerar JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Minimum 0 -Maximum 256}))
```

### 5️⃣ **Iniciar Servidor de Desenvolvimento**

```bash
npm run dev
```

**Acesse:** http://localhost:3000

**Credenciais padrão:**
- **Email:** `admin@pdv.com`
- **Senha:** `admin123`

---

## 🔧 Comandos Úteis

### **Desenvolvimento**

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linter (verificar código)
npm run lint
```

### **Banco de Dados**

```bash
# Conectar ao banco via psql
psql -U postgres -d pdv_roma

# Fazer backup do banco
pg_dump -U postgres pdv_roma > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres -d pdv_roma < backup_20240115.sql

# Resetar banco (CUIDADO: apaga todos os dados)
psql -U postgres -c "DROP DATABASE pdv_roma;"
psql -U postgres -c "CREATE DATABASE pdv_roma;"
# Execute migrations e seed novamente
```

### **Git**

```bash
# Ver status
git status

# Criar nova branch
git checkout -b feature/minha-feature

# Adicionar mudanças
git add .

# Commit
git commit -m "feat: adiciona nova funcionalidade"

# Push para remote
git push -u origin feature/minha-feature

# Pull latest changes
git pull origin main
```

---

## 🐳 Docker (Opcional)

### **Iniciar com Docker Compose**

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## 📦 Estrutura do Projeto

```
pdv-roma/
├── app/                    # Next.js App Router
│   ├── (app)/             # Páginas autenticadas
│   ├── api/               # API Routes
│   └── login/             # Página de login
├── components/            # Componentes React
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Bibliotecas e utilities
│   ├── db/               # Database queries e migrations
│   ├── auth/             # Autenticação
│   ├── utils/            # Utilidades
│   └── validators/       # Schemas Zod
├── docs/                  # Documentação
├── scripts/               # Scripts úteis
└── public/                # Assets estáticos
```

---

## 🔐 Usuários Padrão

Os seguintes usuários são criados automaticamente pelo seed:

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| `admin@pdv.com` | `admin123` | admin | Administrador completo |
| `operador@pdv.com` | `operador123` | operator | Operador de pesagem |

---

## 🧪 Dados Fake

O seed cria automaticamente:
- ✅ 2 transportadoras
- ✅ 2 motoristas
- ✅ 20 contratos de venda (GC-001 a GC-020)
- ✅ Produtos associados aos contratos
- ✅ 15 carregamentos com diferentes status:
  - **stand-by**: Aguardando pesagem final
  - **concluido**: Finalizado
  - **cancelado**: Cancelado
- ✅ Logs de auditoria
- ✅ Notificações fake

**Novos contratos sem carregamentos (para testar fluxo completo):**
- GC-016: Cliente P Agronegócios
- GC-017: Cliente Q Comércio
- GC-018: Cliente R Grãos
- GC-019: Cliente S Exportação
- GC-020: Cliente T Distribuidora

---

## 🛠️ Troubleshooting

### **Erro: `psql: command not found`**

**Linux/Mac:**
```bash
# Adicionar ao PATH
export PATH="/usr/lib/postgresql/15/bin:$PATH"
```

**Windows:**
Adicione `C:\Program Files\PostgreSQL\15\bin` ao PATH do sistema.

### **Erro: `Cannot connect to database`**

1. Verifique se PostgreSQL está rodando:
```bash
# Linux
sudo systemctl status postgresql

# Mac
brew services list

# Windows
services.msc # Procurar por "postgresql"
```

2. Verifique credenciais no `.env.local`

### **Erro: `Port 3000 already in use`**

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### **Erro: `Migration failed`**

Verifique se as migrations estão sendo executadas na ordem correta:
1. `001_init.sql`
2. `002_logs_immutable.sql`
3. `004_appsmith_schema_alignment.sql`
4. `005_fix_encoding_notificacoes.sql`
5. `006_fix_encoding_notificacoes_v2.sql`
6. `007_normalizar_status_carregamentos.sql`
7. `003_seed_fake_data.sql` (opcional - executar por último)

---

## 📚 Próximos Passos

Após o setup, explore:

1. **Documentação Técnica:**
   - [`PROCESSO_PESAGEM.md`](./PROCESSO_PESAGEM.md) - Fluxo de pesagem detalhado
   - [`CORRECOES_SCHEMA_ALINHAMENTO.md`](./CORRECOES_SCHEMA_ALINHAMENTO.md) - Estrutura do banco
   - [`IMPROVEMENTS-ROADMAP.md`](./IMPROVEMENTS-ROADMAP.md) - Melhorias planejadas

2. **Testar Funcionalidades:**
   - Dashboard KPIs
   - Criar novo carregamento
   - Pesagem TARA
   - Pesagem FINAL
   - Histórico e relatórios

3. **Configurar Integrações:**
   - N8N webhook
   - SMTP email
   - Tokens de sistemas externos (Nibo, GC)

---

## 🤝 Contribuindo

```bash
# 1. Fork o projeto
# 2. Criar branch
git checkout -b feature/minha-feature

# 3. Commit mudanças
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push para branch
git push origin feature/minha-feature

# 5. Abrir Pull Request
```

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/mond-day/pdv-roma/issues)
- **Documentação:** [`/docs`](./README.md)

---

**Criado por:** Claude Code Agent
**Para:** PDV Roma System
**Versão:** 1.0.0
