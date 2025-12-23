# 🔗 Integração N8N - Guia Completo

## 📋 Sobre o N8N

O N8N é uma ferramenta de automação self-hosted que permite criar workflows visuais.

**No PDV Roma, o N8N é usado para:**
- Enviar dados de carregamentos finalizados para outros sistemas
- Integrar com ERPs (Nibo, GC, etc.)
- Disparar notificações (email, SMS, Slack, etc.)
- Sincronizar dados com planilhas, CRMs, etc.

---

## ❓ O Endpoint Precisa de Subdomínio?

### Resposta Curta: **NÃO é obrigatório, mas RECOMENDADO**

### Opções Disponíveis:

#### ✅ **Opção 1: Subdomínio (Recomendado para Produção)**

```
https://n8n.seudominio.com/webhook/carregamento
```

**Vantagens:**
- ✅ SSL/HTTPS automático
- ✅ Mais profissional
- ✅ Fácil de lembrar
- ✅ Isolamento de serviços
- ✅ Facilita configuração de firewall

**Como configurar:**
1. Adicione registro DNS:
   ```
   Tipo: A ou CNAME
   Nome: n8n
   Valor: IP do servidor (ou domínio principal)
   ```

2. Configure proxy reverso (Nginx/Traefik):
   ```nginx
   # Exemplo Nginx
   server {
       listen 443 ssl;
       server_name n8n.seudominio.com;

       location / {
           proxy_pass http://localhost:5678;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

#### ⚠️ **Opção 2: IP + Porta**

```
http://192.168.1.100:5678/webhook/carregamento
```

**Desvantagens:**
- ❌ Sem HTTPS (não recomendado)
- ❌ Precisa abrir porta no firewall
- ❌ IP pode mudar
- ❌ Menos seguro

**Quando usar:**
- Apenas em ambiente de desenvolvimento/testes
- Redes internas isoladas

#### ✅ **Opção 3: Subdomínio + Porta**

```
https://n8n.seudominio.com:5678/webhook/carregamento
```

**Meio termo:**
- ✅ HTTPS disponível
- ⚠️ Precisa liberar porta no firewall
- ⚠️ Menos "limpo" que opção 1

#### ⭐ **Opção 4: N8N Cloud (Mais Fácil)**

```
https://seu-workspace.app.n8n.cloud/webhook/carregamento
```

**Vantagens:**
- ✅ Zero configuração de infraestrutura
- ✅ HTTPS automático
- ✅ Backups automáticos
- ✅ Alta disponibilidade
- ❌ Pago (após trial gratuito)

---

## 🚀 Configuração Passo a Passo

### Setup 1: N8N Self-Hosted (Docker)

#### 1. Criar docker-compose.yml para N8N

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=senha-segura
      - N8N_HOST=n8n.seudominio.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.seudominio.com/
      - GENERIC_TIMEZONE=America/Sao_Paulo
    volumes:
      - n8n_data:/home/node/.n8n
    labels:
      # Traefik (se usar)
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.seudominio.com`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"

volumes:
  n8n_data:
```

#### 2. Iniciar N8N

```bash
docker-compose up -d
```

#### 3. Acessar Interface

```
https://n8n.seudominio.com
# ou
http://IP-DO-SERVIDOR:5678
```

---

### Setup 2: Criar Webhook no N8N

#### 1. Criar Novo Workflow

1. Acesse N8N
2. Clique em "New Workflow"
3. Nomeie: "PDV Roma - Carregamentos"

#### 2. Adicionar Nó Webhook

1. Clique em "+" para adicionar nó
2. Busque e selecione "Webhook"
3. Configure:
   ```
   HTTP Method: POST
   Path: carregamento
   Authentication: Header Auth (opcional)
   ```

#### 3. Processar Dados

Adicione nós para processar os dados recebidos:

```
Webhook → Set (opcional) → HTTP Request / Database / Email / etc.
```

**Exemplo de payload recebido:**
```json
{
  "idempotency_key": "finalizar-123-1234567890",
  "carregamento_id": 123,
  "placa": "ABC-1234",
  "cliente_nome": "Cliente A",
  "produto_nome": "Soja",
  "liquido_kg": 45000,
  "status": "finalizado",
  "data_carregamento": "2025-12-23T10:30:00Z",
  "tara_total": 25.5,
  "peso_final_total": 70.5
}
```

#### 4. Copiar URL do Webhook

Após salvar, copie a URL gerada:
```
https://n8n.seudominio.com/webhook/carregamento
```

#### 5. Configurar Token (Opcional mas Recomendado)

**No N8N:**
1. Edite o nó Webhook
2. Em "Authentication" selecione "Header Auth"
3. Configure:
   ```
   Header Name: Authorization
   Header Value: Bearer SEU-TOKEN-SECRETO-AQUI
   ```

---

### Setup 3: Configurar no PDV Roma

#### 1. Acessar Configurações

1. Login como admin
2. Menu lateral > Configurações
3. Seção "Integração n8n"

#### 2. Preencher Dados

```
N8N_WEBHOOK_URL: https://n8n.seudominio.com/webhook/carregamento
N8N_TOKEN: SEU-TOKEN-SECRETO-AQUI (se configurou autenticação)
```

#### 3. Salvar

Clique em "Salvar Todas as Configurações"

---

## 🧪 Testar Integração

### 1. Criar Carregamento de Teste

1. Vá em "Pesagem e Carregamentos"
2. Preencha dados de teste
3. Finalize o carregamento

### 2. Verificar no N8N

1. Acesse o workflow no N8N
2. Veja a aba "Executions"
3. Deve aparecer uma execução com os dados

### 3. Verificar no PDV Roma

1. Dashboard > "Status de Integrações"
2. Deve mostrar "Enviado" ✅
3. Ou "Erro" ❌ (veja logs)

---

## 📊 Exemplos de Workflows N8N

### Exemplo 1: Enviar Email ao Finalizar

```
Webhook → IF (status = finalizado) → Gmail
```

### Exemplo 2: Salvar em Planilha Google

```
Webhook → Google Sheets (Append)
```

### Exemplo 3: Integrar com ERP

```
Webhook → HTTP Request (API do ERP) → IF (erro) → Email Admin
```

### Exemplo 4: Múltiplas Ações

```
Webhook → Split In Batches → [
    → Gmail (notificar cliente)
    → Google Sheets (salvar dados)
    → HTTP Request (ERP)
    → Slack (notificar equipe)
]
```

---

## 🔐 Segurança

### Boas Práticas:

1. **Sempre use HTTPS em produção**
   ```
   ✅ https://n8n.seudominio.com
   ❌ http://n8n.seudominio.com
   ```

2. **Use autenticação Bearer Token**
   ```javascript
   // No N8N Webhook
   Header Auth: Authorization = Bearer TOKEN_SECRETO

   // PDV Roma enviará automaticamente
   ```

3. **Configure firewall**
   ```bash
   # Permitir apenas IP do servidor PDV Roma
   ufw allow from IP_PDV_ROMA to any port 5678
   ```

4. **Use idempotency_key**
   - PDV Roma já envia automaticamente
   - Evita duplicação de webhooks

5. **Monitore falhas**
   - Configure alertas no N8N
   - Verifique Dashboard > Integrações com Erro

---

## 🐛 Troubleshooting

### Problema: "Timeout após 120 segundos"

**Causa:** N8N demorou muito para responder

**Solução:**
1. Otimize workflow do N8N (remova nós lentos)
2. Use processamento assíncrono
3. Aumente timeout (não recomendado):
   ```typescript
   // lib/integrations/n8n.ts
   const TIMEOUT_MS = 180000; // 3 minutos
   ```

### Problema: "N8N_WEBHOOK_URL não configurado"

**Solução:**
1. Vá em Configurações
2. Preencha URL do webhook
3. Salve

### Problema: "HTTP 401 Unauthorized"

**Causa:** Token inválido

**Solução:**
1. Verifique se token no PDV Roma = token no N8N
2. Certifique-se que está usando "Bearer TOKEN"

### Problema: "Connection refused"

**Causa:** N8N não está acessível

**Solução:**
1. Verifique se N8N está rodando: `docker ps | grep n8n`
2. Verifique firewall: `telnet n8n.seudominio.com 5678`
3. Verifique DNS: `nslookup n8n.seudominio.com`

### Problema: Dados não chegam no N8N

**Solução:**
1. Verifique logs do PDV Roma:
   ```bash
   docker logs pdv-roma | grep n8n
   ```
2. Teste webhook manualmente:
   ```bash
   curl -X POST https://n8n.seudominio.com/webhook/carregamento \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU-TOKEN" \
     -d '{"test": true}'
   ```

---

## 📈 Monitoramento

### No PDV Roma:

1. **Dashboard:**
   - "Integrações Pendentes"
   - "Integrações com Erro"

2. **Notificações:**
   - Recebe alerta automático se falhar

3. **API:**
   ```bash
   GET /api/integracoes?status=erro
   ```

### No N8N:

1. **Executions Tab:**
   - Veja histórico de webhooks recebidos

2. **Error Workflow:**
   - Configure workflow para capturar erros

3. **Logs:**
   ```bash
   docker logs n8n -f
   ```

---

## ✅ Checklist de Configuração

- [ ] N8N instalado e rodando
- [ ] Subdomínio configurado (ou IP:porta definido)
- [ ] SSL/HTTPS configurado
- [ ] Workflow criado no N8N
- [ ] Webhook URL copiada
- [ ] Token de autenticação gerado (opcional)
- [ ] URL e Token salvos no PDV Roma
- [ ] Teste realizado com carregamento fake
- [ ] Integração aparece como "Enviado" no Dashboard
- [ ] Monitoring configurado

---

## 🎉 Pronto!

Agora o PDV Roma enviará automaticamente os carregamentos finalizados para o N8N!

**URL recomendada:** `https://n8n.seudominio.com/webhook/carregamento`
