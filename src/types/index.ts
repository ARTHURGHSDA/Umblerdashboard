export interface Contact {
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
  tags?: Tag[]
  last_message?: Message
  response_time?: number
}

export interface Chat {
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
  contact?: Contact
  messages?: Message[]
}

export interface Message {
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

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface ContactTag {
  id: string
  contact_id: string
  tag_id: string
  created_at: string
}

export interface Metrics {
  totalContacts: number
  activeChats: number
  waitingChats: number
  totalMessages: number
  avgResponseTime: number
  todayMessages: number
}