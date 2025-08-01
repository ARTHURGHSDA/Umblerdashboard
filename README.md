# Sistema de Webhook para Gerenciamento de Contatos

Sistema completo para receber e gerenciar contatos via webhook do Umbler, com interface moderna e métricas em tempo real.

## 🚀 Deploy no Vercel

### 1. Configurar Variáveis de Ambiente

No painel do Vercel, adicione as seguintes variáveis de ambiente:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

### 2. URL do Webhook

Após configurar o Supabase, use esta URL no Umbler:
```
https://seu-projeto.supabase.co/functions/v1/webhook-receiver
```

## 🛠️ Configuração Local

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com suas credenciais do Supabase
4. Execute: `npm run dev`

## 📋 Funcionalidades

- ✅ Recebimento de webhooks do Umbler
- ✅ Dashboard com métricas em tempo real
- ✅ Visualização de contatos e conversas
- ✅ Sistema de tags/etiquetas
- ✅ Filtros avançados
- ✅ Cálculo de tempo de resposta
- ✅ Interface responsiva
- ✅ Atualizações em tempo real

## 🔧 Tecnologias

- React + TypeScript
- Tailwind CSS
- Supabase (Database + Edge Functions)
- Vercel (Deploy)
- Lucide React (Ícones)
