import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testando configuração do sistema...\n');

// Check environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Variáveis de ambiente:');
console.log(`  VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ FALTANDO'}`);
console.log(`  VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurado' : '❌ FALTANDO'}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurado' : '❌ FALTANDO'}\n`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas!');
  console.log('📝 Configure o arquivo .env com suas credenciais do Supabase.\n');
  console.log('Exemplo:');
  console.log('VITE_SUPABASE_URL=https://seu-project-id.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=sua-anon-key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key\n');
  process.exit(1);
}

// Test Supabase connection
console.log('🔗 Testando conexão com Supabase...');

try {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Test connection
  const { data, error } = await supabase
    .from('contacts')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.log('❌ Erro de conexão:', error.message);
    console.log('🔧 Possíveis soluções:');
    console.log('  1. Verifique se a URL do Supabase está correta');
    console.log('  2. Verifique se a Service Role Key está correta');
    console.log('  3. Execute as migrações: npx supabase db push');
    process.exit(1);
  }

  console.log('✅ Conexão com Supabase OK!');

  // Check if tables exist
  console.log('\n📊 Verificando estrutura das tabelas...');
  
  const tables = [
    'organizations',
    'channels', 
    'sectors',
    'organization_members',
    'contacts',
    'chats',
    'messages',
    'tags',
    'contact_tags',
    'webhook_logs'
  ];

  for (const table of tables) {
    try {
      const { error: tableError } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        console.log(`❌ Tabela '${table}': ${tableError.message}`);
      } else {
        console.log(`✅ Tabela '${table}': OK`);
      }
    } catch (err) {
      console.log(`❌ Tabela '${table}': Erro ao verificar`);
    }
  }

  console.log('\n🎉 Configuração verificada com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('  1. Execute: npm run dev:api (em um terminal)');
  console.log('  2. Execute: npm run dev (em outro terminal)');
  console.log('  3. Acesse: http://localhost:5173');
  console.log('  4. Teste o webhook no dashboard');

} catch (error) {
  console.log('❌ Erro geral:', error.message);
  process.exit(1);
}