-- Política RLS corrigida para permitir acesso via service role e autenticação
-- Esta migração corrige as políticas para funcionar com o webhook da API

-- Drop existing policies
DROP POLICY IF EXISTS "Public access for demo" ON organizations;
DROP POLICY IF EXISTS "Public access for demo" ON channels;
DROP POLICY IF EXISTS "Public access for demo" ON sectors;
DROP POLICY IF EXISTS "Public access for demo" ON organization_members;
DROP POLICY IF EXISTS "Public access for demo" ON tags;
DROP POLICY IF EXISTS "Public access for demo" ON contacts;
DROP POLICY IF EXISTS "Public access for demo" ON contact_tags;
DROP POLICY IF EXISTS "Public access for demo" ON chats;
DROP POLICY IF EXISTS "Public access for demo" ON messages;
DROP POLICY IF EXISTS "Public access for demo" ON webhook_logs;

-- Criar políticas mais permissivas para service role e usuários autenticados
-- Organizations
CREATE POLICY "Allow service role and authenticated users" ON organizations 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Channels
CREATE POLICY "Allow service role and authenticated users" ON channels 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Sectors
CREATE POLICY "Allow service role and authenticated users" ON sectors 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Organization members
CREATE POLICY "Allow service role and authenticated users" ON organization_members 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Tags
CREATE POLICY "Allow service role and authenticated users" ON tags 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Contacts
CREATE POLICY "Allow service role and authenticated users" ON contacts 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Contact tags
CREATE POLICY "Allow service role and authenticated users" ON contact_tags 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Chats
CREATE POLICY "Allow service role and authenticated users" ON chats 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Messages
CREATE POLICY "Allow service role and authenticated users" ON messages 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Webhook logs
CREATE POLICY "Allow service role and authenticated users" ON webhook_logs 
FOR ALL 
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
) 
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated'
);

-- Adicionar política para permitir acesso anônimo em casos específicos (para desenvolvimento)
-- REMOVA ESTAS POLÍTICAS EM PRODUÇÃO!
CREATE POLICY "Allow anonymous read for development" ON contacts 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous read for development" ON chats 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous read for development" ON messages 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous read for development" ON tags 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous read for development" ON contact_tags 
FOR SELECT 
TO anon 
USING (true);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();