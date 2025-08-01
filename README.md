# Sistema de Webhook Umbler Talk

Sistema completo de integração com webhook do Umbler Talk para gerenciamento de contatos e mensagens do WhatsApp.

## Arquitetura

- **Frontend**: React + TypeScript + Vite
- **Backend**: API do Vercel (Serverless Functions)
- **Banco de dados**: Supabase (PostgreSQL)
- **Webhook**: Endpoint hospedado no Vercel

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Configure as seguintes variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Alternative environment variable names for Vercel
SUPABASE_URL=https://your-project-id.supabase.co

# Webhook Configuration (opcional)
WEBHOOK_SECRET=your-webhook-secret-key
```

### 2. Configuração do Supabase

1. Execute as migrações do banco de dados:
```bash
npx supabase db push
```

2. Aplique a correção das políticas RLS:
```bash
psql -h db.your-project-id.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/20250801111821_jolly_cottage_fixed.sql
```

### 3. Deploy no Vercel

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente no Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Deploy:
```bash
vercel --prod
```

### 4. Configuração do Webhook no Umbler Talk

Configure o webhook no Umbler Talk para apontar para:
```
https://seu-dominio.vercel.app/api/webhook
```

## Endpoints da API

### POST /api/webhook
Recebe dados do webhook do Umbler Talk e processa:
- Contatos
- Chats
- Mensagens
- Tags
- Organizações

## Funcionalidades

### Frontend
- ✅ Dashboard em tempo real
- ✅ Lista de contatos com filtros
- ✅ Métricas de atendimento
- ✅ Atualização automática via WebSocket
- ✅ Polling como fallback (30s)

### Backend
- ✅ Processamento de webhook do Umbler Talk
- ✅ Salvamento estruturado no Supabase
- ✅ Logs de webhook para debug
- ✅ Tratamento de erros robusto
- ✅ CORS configurado

### Banco de dados
- ✅ Estrutura completa de tabelas
- ✅ Políticas RLS configuradas
- ✅ Índices para performance
- ✅ Triggers para updated_at

## Estrutura do Projeto

```
├── api/
│   └── webhook.ts          # Endpoint principal do webhook
├── src/
│   ├── components/         # Componentes React
│   ├── hooks/             # Hooks customizados
│   ├── lib/               # Configuração Supabase
│   └── types/             # Tipos TypeScript
├── supabase/
│   ├── functions/         # Functions do Supabase (descontinuadas)
│   └── migrations/        # Migrações do banco
└── vercel.json           # Configuração do Vercel
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Logs e Debug

- Logs do webhook são salvos na tabela `webhook_logs`
- Console logs estão disponíveis no Vercel Functions
- Erros são capturados e salvos com detalhes

## Troubleshooting

### Webhook não está salvando dados
1. Verifique as variáveis de ambiente no Vercel
2. Confirme que o `SUPABASE_SERVICE_ROLE_KEY` está correto
3. Verifique os logs na tabela `webhook_logs`

### Frontend não está atualizando
1. Verifique a conexão com Supabase
2. Confirme que as políticas RLS estão corretas
3. Verifique o console do navegador para erros

### Problemas de CORS
1. Verifique a configuração no `vercel.json`
2. Confirme que os headers estão sendo enviados corretamente
3. Teste com diferentes origens se necessário

## Produção

Para produção, remova as políticas de desenvolvimento:
```sql
DROP POLICY "Allow anonymous read for development" ON contacts;
DROP POLICY "Allow anonymous read for development" ON chats;
DROP POLICY "Allow anonymous read for development" ON messages;
DROP POLICY "Allow anonymous read for development" ON tags;
DROP POLICY "Allow anonymous read for development" ON contact_tags;
```
