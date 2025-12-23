# PDV Roma

Sistema web para operação de carregamentos (balança), substituindo Appsmith.

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **Zod** (validação)
- **JWT** (autenticação)

## Estrutura do Projeto

```
repo/
  app/                    # Next.js App Router
    (auth)/              # Rotas de autenticação
    (app)/               # Rotas protegidas
    api/                 # API Routes
  components/            # Componentes React
  docs/                  # Documentação técnica
  infra/                 # Infraestrutura (Docker, etc)
  lib/                   # Bibliotecas e utilitários
    auth/               # Autenticação e RBAC
    db/                 # Database (pool, queries, migrations)
    integrations/       # Integrações externas (n8n, etc)
    queue/              # Worker e outbox pattern
    validators/         # Schemas Zod
  scripts/               # Scripts de desenvolvimento (Windows)
```

## Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pdv_roma

# Security
MASTER_KEY=your-32-char-master-key-here-change-in-production
SESSION_SECRET=your-session-secret-here-change-in-production

# App
NODE_ENV=development
PORT=3000
```

### Banco de Dados

Execute as migrations na ordem:

```bash
psql -U postgres -d pdv_roma -f lib/db/migrations/001_init.sql
psql -U postgres -d pdv_roma -f lib/db/migrations/002_logs_immutable.sql
psql -U postgres -d pdv_roma -f lib/db/migrations/004_appsmith_schema_alignment.sql
```

**Nota:** A migration 004 alinha o schema com o Appsmith original, adicionando tabelas de vendas, produtos, motoristas, transportadoras, placas e configurações de webhooks.

### Instalação

```bash
npm install
# ou
pnpm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Deploy

### Docker

1. Build da imagem:

```bash
docker build -t pdv-roma .
```

2. Execute com docker-compose:

```bash
cd infra/portainer
docker-compose up -d
```

### GitHub Actions

O workflow `build-and-push-ghcr.yml` automaticamente:
- Builda a imagem Docker
- Faz push para GitHub Container Registry
- Taggeia com versão, branch e SHA

### Portainer

1. Configure as variáveis de ambiente no Portainer
2. Use o `docker-compose.yml` fornecido
3. Configure Traefik labels conforme necessário

## Funcionalidades

### Componentes UI Implementados

- **EixoInput**: Input de peso com validação visual de excesso
- **PesagemTotais**: Painel de totais com formatação automática
- **SearchInput**: Busca com autocomplete e debounce
- **FilterBar**: Barra de filtros reutilizável com indicadores
- **Skeleton**: Loading states com skeletons
- **Alert**: Sistema de alertas/mensagens
- **Tabs**: Sistema de abas
- **MultiSelect**: Select múltiplo customizado

### Perfis

- **Admin**: Gerencia usuários, configurações, auditoria
- **Faturador**: Opera carregamentos, consulta histórico, relatórios

### Carregamentos

- Status: `standby | finalizado | cancelado`
- Integração n8n: `pendente | enviado | erro` (não trava operação)
- Idempotência baseada em `idempotency_key`

### Integração n8n

- Envio assíncrono (worker em background)
- Timeout de 120 segundos
- Limite de 5 tentativas
- Notificações em caso de erro

### Logs

- Append-only (imutáveis)
- Auditoria completa de ações
- Filtros por período, usuário, ação, carregamento

### Relatórios

- Export CSV (`,`) e PDF oficial
- Agrupamento por cliente/transportadora/motorista
- Filtros por período

## Segurança

- Senhas hasheadas com bcrypt
- Sessões via JWT (httpOnly cookies)
- Configurações sensíveis criptografadas (AES)
- RBAC (Role-Based Access Control)
- Logs imutáveis (triggers PostgreSQL)

## Documentação

A documentação técnica está na pasta `docs/`:

- **CORRECOES_SCHEMA_ALINHAMENTO.md**: Correções de alinhamento com schema real
- **PDV_Roma_escopo_tecnico.md**: Documentação do sistema Appsmith original
- **PROCESSO_PESAGEM.md**: Documentação completa do processo de pesagem

## Próximos Passos

Consulte `PROXIMOS_PASSOS.md` para o roadmap completo. Prioridades:

1. Executar migration 004 (alinhamento com Appsmith)
2. Criar queries para novas tabelas (vendas, motoristas, etc.)
3. Implementar busca real de vendas
4. Completar fluxo de pesagem com validações

## Licença

Proprietário - PDV Roma

