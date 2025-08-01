# 🚀 Guia Completo de Configuração - Sistema Webhook Umbler Talk

## ❌ Problemas Identificados e Resolvidos

1. **Backend não estava rodando** - Criado servidor de desenvolvimento
2. **Variáveis de ambiente faltando** - Configuração completa criada
3. **API não acessível localmente** - Proxy configurado no Vite
4. **Logs de debug ausentes** - Sistema completo de logs implementado
5. **Tabelas vazias** - Dados de teste e webhook funcionando

## 🔧 Configuração Passo a Passo

### 1. **Configurar Variáveis de Ambiente**

Edite o arquivo `.env` com suas credenciais reais do Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-ANON-KEY

# Supabase Service Role Key (OBRIGATÓRIO para webhook funcionar)
SUPABASE_SERVICE_ROLE_KEY=SUA-SERVICE-ROLE-KEY

# Alternative environment variable names for Vercel
SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret-key

# Development
NODE_ENV=development
```

### 2. **Instalar Dependências**

```bash
npm install
```

### 3. **Executar Sistema Completo**

```bash
# Opção 1: Rodar API e Frontend juntos
npm run dev:full

# Opção 2: Rodar separadamente
# Terminal 1:
npm run dev:api

# Terminal 2:
npm run dev
```

### 4. **Verificar se Está Funcionando**

1. **Health Check da API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Frontend:** http://localhost:5173

3. **Testar Webhook:**
   - Clique no botão "Testar Webhook" no dashboard
   - Ou acesse: http://localhost:3001/api/test-webhook

## 🔍 Como Verificar se Está Funcionando

### 1. **Logs do Servidor**
O servidor mostra logs detalhados:
```
🚀 Servidor de desenvolvimento rodando na porta 3001
📋 Health check: http://localhost:3001/api/health
🔗 Webhook endpoint: http://localhost:3001/api/webhook
🧪 Test endpoint: http://localhost:3001/api/test-webhook
```

### 2. **Teste do Webhook**
Quando você testar o webhook, verá logs como:
```
🔔 Webhook recebido: { method: 'POST', url: '/api/webhook', body: 'Payload presente' }
🔧 Configuração: { supabaseUrl: 'Configurado', serviceKey: 'Configurado' }
🔍 Testando conexão com Supabase...
✅ Conexão com Supabase OK
💾 Salvando log do webhook...
✅ Log do webhook salvo
🔄 Processando webhook de mensagem...
👥 Processando organização...
📱 Processando canal...
🏢 Processando setor...
👤 Processando membro...
📞 Processando contato...
🏷️ Processando tags...
💬 Processando chat...
💌 Processando mensagem...
✅ Marcando webhook como processado...
🎉 Webhook event_dev_1234567890 processado com sucesso!
```

### 3. **Dados no Supabase**
Após o teste, você deve ver dados nas tabelas:
- `contacts` - Contatos criados
- `chats` - Conversas
- `messages` - Mensagens
- `webhook_logs` - Logs dos webhooks
- `organizations` - Organizações
- `channels` - Canais
- `sectors` - Setores
- `tags` - Tags

## 🚨 Troubleshooting

### ❌ "Variáveis de ambiente faltando"
**Solução:** Configure corretamente o `.env` com suas credenciais reais do Supabase.

### ❌ "Supabase connection failed"
**Problemas possíveis:**
1. URL do Supabase incorreta
2. Service Role Key incorreta
3. Tabelas não existem

**Solução:**
1. Verifique as credenciais no painel do Supabase
2. Execute as migrações: `npx supabase db push`
3. Aplique as políticas RLS corrigidas

### ❌ "Frontend não mostra dados"
**Solução:**
1. Verifique se a API está rodando na porta 3001
2. Teste o webhook primeiro
3. Verifique o console do navegador para erros

### ❌ "API não acessível"
**Solução:**
1. Certifique-se que `npm run dev:api` está rodando
2. Verifique se a porta 3001 não está em uso
3. Teste o health check: `curl http://localhost:3001/api/health`

## 📊 Estrutura de Dados de Teste

Quando você testar o webhook, será criado um contato de exemplo:

```json
{
  "id": "contact_dev_1234567890",
  "name": "João Silva (DEV)",
  "phone_number": "+5511999999999",
  "organization_id": "org_dev_123",
  "tags": ["Cliente VIP", "Desenvolvimento"]
}
```

## 🌐 Deploy no Vercel

### 1. **Configurar Variáveis no Vercel**
No painel do Vercel, adicione:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. **Deploy**
```bash
vercel --prod
```

### 3. **Configurar Webhook no Umbler**
Use a URL: `https://seu-projeto.vercel.app/api/webhook`

## ✅ Checklist Final

- [ ] Arquivo `.env` configurado com credenciais reais
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor de desenvolvimento rodando (`npm run dev:api`)
- [ ] Frontend acessível em http://localhost:5173
- [ ] Health check retorna status OK
- [ ] Teste do webhook funciona e cria dados
- [ ] Dashboard mostra contatos e métricas
- [ ] Logs detalhados aparecem no console

## 🎯 Próximos Passos

1. **Teste Local:** Garanta que tudo funciona localmente primeiro
2. **Deploy:** Faça o deploy no Vercel
3. **Configurar Umbler:** Aponte o webhook para sua URL do Vercel
4. **Monitorar:** Use os logs para acompanhar os webhooks reais

## 📞 Se Ainda Não Funcionar

1. **Verifique os logs** do servidor de desenvolvimento
2. **Teste cada endpoint** individualmente
3. **Confirme as credenciais** do Supabase
4. **Execute as migrações** do banco de dados
5. **Verifique as políticas RLS** no Supabase