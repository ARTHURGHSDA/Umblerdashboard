# 🚀 Sistema Webhook Umbler Talk - Início Rápido

## ⚡ Início Ultra Rápido (1 comando)

```bash
npm install && npm start
```

**Pronto! O sistema vai:**
1. ✅ Instalar todas as dependências
2. ✅ Criar arquivo `.env` se não existir
3. ✅ Verificar configuração
4. ✅ Iniciar API (porta 3001)
5. ✅ Iniciar Frontend (porta 5173)
6. ✅ Mostrar dados de exemplo

## 🌐 Acessar o Sistema

- **Dashboard:** http://localhost:5173
- **API:** http://localhost:3001
- **Teste Webhook:** Clique no botão "Testar Webhook" no dashboard

## 🔧 Para Usar com Dados Reais

1. **Obtenha suas credenciais do Supabase:**
   - Acesse https://supabase.com/dashboard
   - Crie um projeto ou use um existente
   - Vá em Settings > API
   - Copie: `URL`, `anon key`, `service_role key`

2. **Configure o arquivo `.env`:**
   ```env
   VITE_SUPABASE_URL=https://seu-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
   ```

3. **Execute as migrações do banco:**
   ```bash
   npx supabase db push
   ```

4. **Reinicie o sistema:**
   ```bash
   npm start
   ```

## 🎯 Configurar Webhook no Umbler

Quando fizer deploy no Vercel, use esta URL no Umbler:
```
https://seu-projeto.vercel.app/api/webhook
```

## 📋 Comandos Úteis

```bash
npm start          # Iniciar tudo automaticamente
npm run dev:api    # Só a API
npm run dev        # Só o frontend
npm run test:setup # Testar configuração
```

## 🆘 Problemas?

1. **Sistema não inicia:** Execute `npm install` primeiro
2. **Erro de porta:** Feche outros processos nas portas 3001 e 5173
3. **Dados não aparecem:** Use o botão "Testar Webhook" no dashboard
4. **Supabase não conecta:** Configure o `.env` com credenciais reais

## ✨ Funciona Sem Configuração

O sistema funciona imediatamente com dados de exemplo, mesmo sem configurar o Supabase. Configure apenas quando quiser dados reais do Umbler Talk.

---

**🎉 É isso! Super simples, né?**