#!/usr/bin/env node

import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🚀 Iniciando Sistema Webhook Umbler Talk\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('❌ Arquivo .env não encontrado!');
  console.log('📝 Criando arquivo .env de exemplo...\n');
  
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-ANON-KEY

# Supabase Service Role Key (OBRIGATÓRIO para webhook funcionar)
SUPABASE_SERVICE_ROLE_KEY=SUA-SERVICE-ROLE-KEY

# Alternative environment variable names for Vercel
SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret-key

# Development
NODE_ENV=development`;

  fs.writeFileSync('.env', envContent);
  
  console.log('✅ Arquivo .env criado!');
  console.log('📋 Configure suas credenciais do Supabase no arquivo .env');
  console.log('🔗 Acesse: https://supabase.com/dashboard para obter suas credenciais\n');
}

// Check environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Status da Configuração:');
console.log(`  VITE_SUPABASE_URL: ${supabaseUrl && !supabaseUrl.includes('SEU-PROJECT') ? '✅ Configurado' : '⚠️ Precisa configurar'}`);
console.log(`  VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey && !supabaseAnonKey.includes('SUA-ANON') ? '✅ Configurado' : '⚠️ Precisa configurar'}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey && !supabaseServiceKey.includes('SUA-SERVICE') ? '✅ Configurado' : '⚠️ Precisa configurar'}\n`);

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseServiceKey && 
  !supabaseUrl.includes('SEU-PROJECT') && 
  !supabaseAnonKey.includes('SUA-ANON') && 
  !supabaseServiceKey.includes('SUA-SERVICE');

if (isSupabaseConfigured) {
  console.log('🔗 Testando conexão com Supabase...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabase
      .from('contacts')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('⚠️ Erro de conexão com Supabase:', error.message);
      console.log('🔄 Continuando com dados de exemplo...\n');
    } else {
      console.log('✅ Conexão com Supabase OK!\n');
    }
  } catch (err) {
    console.log('⚠️ Não foi possível conectar ao Supabase');
    console.log('🔄 Continuando com dados de exemplo...\n');
  }
} else {
  console.log('⚠️ Supabase não configurado');
  console.log('🔄 Usando dados de exemplo para demonstração\n');
}

console.log('🎯 Iniciando serviços...\n');

// Start API server
console.log('🔧 Iniciando servidor da API...');
const apiServer = spawn('node', ['server/dev-server.js'], {
  stdio: 'pipe',
  shell: true
});

apiServer.stdout.on('data', (data) => {
  console.log(`[API] ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data.toString().trim()}`);
});

// Wait a bit for API server to start
setTimeout(() => {
  console.log('🎨 Iniciando frontend...');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('Local:') || output.includes('ready')) {
      console.log(`[FRONTEND] ${output}`);
    }
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando serviços...');
    apiServer.kill();
    frontend.kill();
    process.exit(0);
  });

  console.log('\n🎉 Sistema iniciado com sucesso!');
  console.log('📋 Informações importantes:');
  console.log('  • Frontend: http://localhost:5173');
  console.log('  • API: http://localhost:3001');
  console.log('  • Health Check: http://localhost:3001/api/health');
  console.log('  • Teste Webhook: Clique no botão "Testar Webhook" no dashboard');
  console.log('\n💡 Dicas:');
  if (!isSupabaseConfigured) {
    console.log('  • Configure o Supabase no arquivo .env para dados reais');
  }
  console.log('  • Use Ctrl+C para parar os serviços');
  console.log('  • Monitore os logs para debug\n');

}, 2000);

// Handle API server errors
apiServer.on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor da API:', err.message);
  process.exit(1);
});

apiServer.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor da API parou com código ${code}`);
  }
});