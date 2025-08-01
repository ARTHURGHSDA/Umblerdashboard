import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase não configurado - usando dados de exemplo')
  console.warn('📝 Configure o arquivo .env com suas credenciais do Supabase')
  console.warn('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.warn('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

// Create a fallback client if environment variables are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          organization_id: string
          name: string
          phone_number: string
          profile_picture_url: string | null
          is_blocked: boolean
          last_active_utc: string | null
          contact_type: string
          group_identifier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          name: string
          phone_number: string
          profile_picture_url?: string | null
          is_blocked?: boolean
          last_active_utc?: string | null
          contact_type?: string
          group_identifier?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          phone_number?: string
          profile_picture_url?: string | null
          is_blocked?: boolean
          last_active_utc?: string | null
          contact_type?: string
          group_identifier?: string | null
        }
      }
      chats: {
        Row: {
          id: string
          organization_id: string
          contact_id: string
          channel_id: string
          sector_id: string
          assigned_member_id: string | null
          is_open: boolean
          is_private: boolean
          is_waiting: boolean
          waiting_since_utc: string | null
          total_unread: number
          total_ai_responses: number | null
          closed_at_utc: string | null
          first_contact_message_id: string | null
          first_member_reply_id: string | null
          first_contact_message_at: string | null
          first_member_reply_at: string | null
          created_at: string
          updated_at: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          contact_id: string | null
          organization_member_id: string | null
          content: string
          message_type: string
          source: string
          message_state: string
          is_private: boolean
          event_at_utc: string
          file_url: string | null
          thumbnail_url: string | null
          in_reply_to: string | null
          template_id: string | null
          billable: boolean | null
          deducted_ai_credits: number | null
          created_at: string
          updated_at: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
      }
      contact_tags: {
        Row: {
          id: string
          contact_id: string
          tag_id: string
          created_at: string
        }
      }
    }
  }
}