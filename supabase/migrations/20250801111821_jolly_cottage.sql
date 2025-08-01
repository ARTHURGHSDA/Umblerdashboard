/*
  # Sistema Completo de Webhook para Contatos

  1. New Tables
    - `organizations` - Organizações/empresas
    - `channels` - Canais de comunicação (WhatsApp, etc)
    - `sectors` - Setores/departamentos
    - `organization_members` - Membros da organização/atendentes
    - `contacts` - Contatos dos clientes
    - `chats` - Conversas/sessões de chat
    - `messages` - Mensagens individuais
    - `tags` - Etiquetas/tags do sistema
    - `contact_tags` - Relacionamento many-to-many entre contatos e tags
    - `webhook_logs` - Log de webhooks recebidos

  2. Security
    - Enable RLS em todas as tabelas
    - Políticas para acesso autenticado

  3. Indexes
    - Índices para otimizar consultas frequentes
    - Índices compostos para filtros e ordenação
*/

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id text PRIMARY KEY,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Channels table  
CREATE TABLE IF NOT EXISTS channels (
  id text PRIMARY KEY,
  organization_id text REFERENCES organizations(id),
  channel_type text NOT NULL,
  phone_number text,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sectors table
CREATE TABLE IF NOT EXISTS sectors (
  id text PRIMARY KEY,
  organization_id text REFERENCES organizations(id),
  name text NOT NULL,
  is_default boolean DEFAULT false,
  order_index integer DEFAULT 0,
  group_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id text PRIMARY KEY,
  organization_id text REFERENCES organizations(id),
  name text,
  email text,
  is_muted boolean DEFAULT false,
  total_unread integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id text PRIMARY KEY,
  organization_id text REFERENCES organizations(id),
  name text NOT NULL,
  phone_number text NOT NULL,
  profile_picture_url text,
  is_blocked boolean DEFAULT false,
  last_active_utc timestamptz,
  contact_type text DEFAULT 'DirectMessage',
  group_identifier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact tags junction table
CREATE TABLE IF NOT EXISTS contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id text REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id text REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contact_id, tag_id)
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id text PRIMARY KEY,
  organization_id text REFERENCES organizations(id),
  contact_id text REFERENCES contacts(id),
  channel_id text REFERENCES channels(id),
  sector_id text REFERENCES sectors(id),
  assigned_member_id text REFERENCES organization_members(id),
  is_open boolean DEFAULT true,
  is_private boolean DEFAULT false,
  is_waiting boolean DEFAULT false,
  waiting_since_utc timestamptz,
  total_unread integer DEFAULT 0,
  total_ai_responses integer DEFAULT 0,
  closed_at_utc timestamptz,
  first_contact_message_id text,
  first_member_reply_id text,
  first_contact_message_at timestamptz,
  first_member_reply_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  chat_id text REFERENCES chats(id),
  contact_id text REFERENCES contacts(id),
  organization_member_id text REFERENCES organization_members(id),
  content text NOT NULL,
  message_type text DEFAULT 'Text',
  source text NOT NULL, -- 'Contact' or 'Member'
  message_state text DEFAULT 'Sent', -- 'Sent', 'Delivered', 'Read'
  is_private boolean DEFAULT false,
  event_at_utc timestamptz NOT NULL,
  file_url text,
  thumbnail_url text,
  in_reply_to text,
  template_id text,
  billable boolean,
  deducted_ai_credits integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text,
  event_type text,
  event_date timestamptz,
  payload jsonb,
  processed boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public access for demo" ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON channels FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON sectors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON organization_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON contact_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON chats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access for demo" ON webhook_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_last_active ON contacts(last_active_utc DESC);
CREATE INDEX IF NOT EXISTS idx_chats_contact_id ON chats(contact_id);
CREATE INDEX IF NOT EXISTS idx_chats_organization_id ON chats(organization_id);
CREATE INDEX IF NOT EXISTS idx_chats_is_waiting ON chats(is_waiting);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_event_at ON messages(event_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id ON contact_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- Insert some default tags
INSERT INTO tags (id, name, color) VALUES 
  ('tag_1', 'Novo Cliente', '#10B981'),
  ('tag_2', 'VIP', '#F59E0B'),
  ('tag_3', 'Suporte', '#EF4444'),
  ('tag_4', 'Vendas', '#3B82F6'),
  ('tag_5', 'Troca', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;