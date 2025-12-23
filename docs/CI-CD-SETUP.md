# 🚀 CI/CD Setup - Deploy Automático no Portainer

Este guia explica como configurar o deploy automático do PDV Roma no Portainer via GitHub Actions.

## 📋 Pré-requisitos

- Conta no GitHub com o repositório do projeto
- Portainer instalado e acessível
- Stack criada no Portainer (usando `infra/portainer/docker-compose.yml`)

---

## 🔧 Configuração Passo a Passo

### 1️⃣ Configurar Webhook no Portainer

1. **Acesse sua Stack no Portainer:**
   - Vá em `Stacks` > Selecione sua stack `pdv-roma`

2. **Habilitar Webhook:**
   - Role até a seção "Webhooks"
   - Clique em "Add webhook"
   - **Nome:** `github-actions-deploy`
   - Copie a URL gerada (será algo como):
     ```
     https://portainer.seudominio.com/api/webhooks/xxx-xxx-xxx
     ```

3. **Configurar Auto-update:**
   - Em "Re-pull image and redeploy" → **Habilitar**
   - Isso faz o Portainer baixar a nova imagem automaticamente

### 2️⃣ Configurar Secret no GitHub

1. **Acesse o repositório no GitHub:**
   - Vá em `Settings` > `Secrets and variables` > `Actions`

2. **Adicionar Secret:**
   - Clique em "New repository secret"
   - **Nome:** `PORTAINER_WEBHOOK_URL`
   - **Value:** Cole a URL do webhook do Portainer
   - Clique em "Add secret"

### 3️⃣ Configurar GitHub Container Registry

**Opção A: Usar GitHub Container Registry (Recomendado)**

1. **Permissões do Package:**
   - Vá em `Settings` > `Actions` > `General`
   - Em "Workflow permissions" selecione:
     - ✅ Read and write permissions
     - ✅ Allow GitHub Actions to create and approve pull requests

2. **Tornar Package Público (Opcional):**
   - Após o primeiro build, vá em "Packages" do seu repositório
   - Clique no package `pdv-roma`
   - `Package settings` > `Change visibility` > `Public`

**Opção B: Usar Docker Hub (Alternativa)**

Se preferir usar Docker Hub ao invés do GitHub Container Registry:

1. Crie conta no [Docker Hub](https://hub.docker.com)

2. Adicione secrets no GitHub:
   - `DOCKERHUB_USERNAME`: seu usuário do Docker Hub
   - `DOCKERHUB_TOKEN`: token de acesso (criar em Account Settings > Security)

3. Modifique `.github/workflows/docker-build-deploy.yml`:
   ```yaml
   env:
     REGISTRY: docker.io  # ou deixe vazio
     IMAGE_NAME: seu-usuario/pdv-roma
   ```

### 4️⃣ Atualizar docker-compose.yml

Edite `infra/portainer/docker-compose.yml`:

```yaml
services:
  pdv-roma:
    # Usar imagem do GitHub Container Registry
    image: ghcr.io/mond-day/pdv-roma:latest

    # OU usar imagem do Docker Hub
    # image: docker.io/seu-usuario/pdv-roma:latest

    container_name: pdv-roma
    restart: unless-stopped
    # ... resto da configuração
```

---

## 🎯 Como Funciona

### Fluxo Automático:

```
1. Push para branch main/master
   ↓
2. GitHub Actions detecta mudança
   ↓
3. Build da imagem Docker
   ↓
4. Push para GitHub Container Registry
   ↓
5. Trigger webhook do Portainer
   ↓
6. Portainer faz pull da nova imagem
   ↓
7. Redeploy automático da stack
   ↓
8. ✅ Deploy concluído!
```

### Workflows Disponíveis:

1. **`docker-build-deploy.yml`** (Principal)
   - **Trigger:** Push para main/master/production
   - **Ações:**
     - Build da imagem Docker
     - Push para registry
     - Deploy automático no Portainer

2. **`docker-test.yml`** (Testes)
   - **Trigger:** Pull Requests
   - **Ações:**
     - Testa se a imagem builda corretamente
     - Não faz deploy

---

## 🔍 Monitoramento

### Ver Status do Deploy:

1. **No GitHub:**
   - Vá em "Actions" no repositório
   - Veja o status do workflow

2. **No Portainer:**
   - Vá em "Stacks" > sua stack
   - Veja logs em "Containers" > `pdv-roma` > "Logs"

### Logs Importantes:

```bash
# Ver logs do container
docker logs pdv-roma -f

# Ver status
docker ps | grep pdv-roma

# Ver última imagem baixada
docker images | grep pdv-roma
```

---

## 🐛 Troubleshooting

### Problema: Webhook não funciona

**Solução:**
1. Verifique se o webhook foi criado corretamente no Portainer
2. Teste manualmente:
   ```bash
   curl -X POST "https://portainer.seudominio.com/api/webhooks/xxx"
   ```
3. Verifique se o secret `PORTAINER_WEBHOOK_URL` está configurado

### Problema: Build falha no GitHub Actions

**Solução:**
1. Verifique os logs em "Actions"
2. Verifique se o Dockerfile está correto
3. Verifique se as permissões do GitHub Actions estão corretas

### Problema: Imagem não atualiza no Portainer

**Solução:**
1. Verifique se "Re-pull image" está habilitado no webhook
2. Force pull manual:
   ```bash
   docker pull ghcr.io/mond-day/pdv-roma:latest
   docker-compose up -d --force-recreate
   ```

### Problema: "Permission denied" ao acessar package

**Solução:**
1. Torne o package público (GitHub Packages > Settings > Change visibility)
2. Ou configure autenticação no Portainer:
   ```yaml
   services:
     pdv-roma:
       image: ghcr.io/mond-day/pdv-roma:latest
       # Adicionar credenciais se package for privado
   ```

---

## 🔐 Variáveis de Ambiente

Configure na Stack do Portainer:

```yaml
environment:
  # Database
  - DATABASE_URL=postgresql://user:pass@postgres:5432/pdv_roma

  # Segurança
  - MASTER_KEY=seu-master-key-32-chars
  - SESSION_SECRET=seu-session-secret-64-chars

  # N8N (opcional)
  - N8N_WEBHOOK_URL=https://n8n.seudominio.com/webhook/carregamento
  - N8N_TOKEN=seu-token-n8n

  # Produção
  - NODE_ENV=production
```

---

## 📝 Comandos Úteis

```bash
# Build manual local
docker build -t pdv-roma:local .

# Testar imagem localmente
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e MASTER_KEY=... \
  -e SESSION_SECRET=... \
  pdv-roma:local

# Ver imagens disponíveis
docker images | grep pdv-roma

# Forçar pull da última versão
docker pull ghcr.io/mond-day/pdv-roma:latest

# Restart da stack no Portainer (via CLI)
docker-compose -f infra/portainer/docker-compose.yml up -d --force-recreate
```

---

## ✅ Checklist de Configuração

- [ ] Webhook criado no Portainer
- [ ] Secret `PORTAINER_WEBHOOK_URL` configurado no GitHub
- [ ] Permissões do GitHub Actions configuradas (Read and write)
- [ ] docker-compose.yml atualizado com imagem correta
- [ ] Variáveis de ambiente configuradas na Stack
- [ ] Primeiro push realizado para testar
- [ ] Deploy automático funcionando
- [ ] Logs verificados e sistema rodando

---

## 🎉 Pronto!

Agora a cada push para a branch main/master/production:
1. ✅ Imagem é buildada automaticamente
2. ✅ Push para registry
3. ✅ Deploy automático no Portainer
4. ✅ Sistema atualizado sem intervenção manual!

---

## 📚 Recursos Adicionais

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Portainer Webhooks](https://docs.portainer.io/user/docker/stacks/webhooks)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Compose](https://docs.docker.com/compose/)
