import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

// Interface para o payload do Umbler Talk
interface UmblerWebhookPayload {
  Type: string
  EventDate: string
  Payload: {
    Type: string
    Content: {
      Organization: { Id: string }
      Contact: {
        Id: string
        Name: string
        PhoneNumber: string
        ProfilePictureUrl?: string
        IsBlocked: boolean
        LastActiveUTC: string
        ContactType: string
        Tags: Array<{ Id: string; Name: string }>
      }
      Channel: {
        Id: string
        Name: string
        PhoneNumber: string
        ChannelType: string
      }
      Sector: {
        Id: string
        Name: string
        Default: boolean
        Order: number
      }
      OrganizationMember: {
        Id: string
        Muted: boolean
        TotalUnread?: number
      }
      LastMessage: {
        Id: string
        Content: string
        MessageType: string
        Source: string
        MessageState: string
        EventAtUTC: string
        SentByOrganizationMember?: string
        IsPrivate: boolean
      }
      Id: string
      Open: boolean
      Private: boolean
      Waiting: boolean
      WaitingSinceUTC?: string
      TotalUnread: number
      EventAtUTC: string
      FirstContactMessage?: {
        Id: string
        EventAtUTC: string
      }
      FirstMemberReplyMessage?: {
        Id: string
        EventAtUTC: string
      }
      CreatedAtUTC: string
    }
  }
  EventId: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const webhookData: UmblerWebhookPayload = req.body

    console.log('Webhook recebido:', {
      type: webhookData.Type,
      eventId: webhookData.EventId,
      eventDate: webhookData.EventDate
    })

    // Log do webhook recebido
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        event_id: webhookData.EventId,
        event_type: webhookData.Type,
        event_date: webhookData.EventDate,
        payload: webhookData,
        processed: false
      })

    if (logError) {
      console.error('Erro ao salvar log do webhook:', logError)
    }

    // Processar apenas webhooks do tipo Message com payload Chat
    if (webhookData.Type === 'Message' && webhookData.Payload.Type === 'Chat') {
      const content = webhookData.Payload.Content
      const timestamp = new Date().toISOString()

      try {
        // 1. Upsert Organization
        const { error: orgError } = await supabase
          .from('organizations')
          .upsert({
            id: content.Organization.Id,
            name: `Organization ${content.Organization.Id}`,
            updated_at: timestamp
          })

        if (orgError) throw new Error(`Organization error: ${orgError.message}`)

        // 2. Upsert Channel
        const { error: channelError } = await supabase
          .from('channels')
          .upsert({
            id: content.Channel.Id,
            organization_id: content.Organization.Id,
            channel_type: content.Channel.ChannelType,
            phone_number: content.Channel.PhoneNumber,
            name: content.Channel.Name,
            updated_at: timestamp
          })

        if (channelError) throw new Error(`Channel error: ${channelError.message}`)

        // 3. Upsert Sector
        const { error: sectorError } = await supabase
          .from('sectors')
          .upsert({
            id: content.Sector.Id,
            organization_id: content.Organization.Id,
            name: content.Sector.Name,
            is_default: content.Sector.Default,
            order_index: content.Sector.Order,
            updated_at: timestamp
          })

        if (sectorError) throw new Error(`Sector error: ${sectorError.message}`)

        // 4. Upsert Organization Member
        const { error: memberError } = await supabase
          .from('organization_members')
          .upsert({
            id: content.OrganizationMember.Id,
            organization_id: content.Organization.Id,
            is_muted: content.OrganizationMember.Muted,
            total_unread: content.OrganizationMember.TotalUnread || 0,
            updated_at: timestamp
          })

        if (memberError) throw new Error(`Member error: ${memberError.message}`)

        // 5. Upsert Contact
        const { error: contactError } = await supabase
          .from('contacts')
          .upsert({
            id: content.Contact.Id,
            organization_id: content.Organization.Id,
            name: content.Contact.Name,
            phone_number: content.Contact.PhoneNumber,
            profile_picture_url: content.Contact.ProfilePictureUrl || null,
            is_blocked: content.Contact.IsBlocked,
            last_active_utc: content.Contact.LastActiveUTC,
            contact_type: content.Contact.ContactType,
            updated_at: timestamp
          })

        if (contactError) throw new Error(`Contact error: ${contactError.message}`)

        // 6. Processar Tags
        for (const tag of content.Contact.Tags) {
          // Upsert tag
          const { error: tagError } = await supabase
            .from('tags')
            .upsert({
              id: tag.Id,
              name: tag.Name,
              color: '#3B82F6', // cor padrão
              updated_at: timestamp
            })

          if (tagError) {
            console.error(`Tag error for ${tag.Id}:`, tagError.message)
            continue
          }

          // Upsert contact_tag relationship
          const { error: contactTagError } = await supabase
            .from('contact_tags')
            .upsert({
              contact_id: content.Contact.Id,
              tag_id: tag.Id
            })

          if (contactTagError) {
            console.error(`Contact tag error:`, contactTagError.message)
          }
        }

        // 7. Upsert Chat
        const { error: chatError } = await supabase
          .from('chats')
          .upsert({
            id: content.Id,
            organization_id: content.Organization.Id,
            contact_id: content.Contact.Id,
            channel_id: content.Channel.Id,
            sector_id: content.Sector.Id,
            assigned_member_id: content.OrganizationMember.Id,
            is_open: content.Open,
            is_private: content.Private,
            is_waiting: content.Waiting,
            waiting_since_utc: content.WaitingSinceUTC || null,
            total_unread: content.TotalUnread,
            first_contact_message_id: content.FirstContactMessage?.Id || null,
            first_member_reply_id: content.FirstMemberReplyMessage?.Id || null,
            first_contact_message_at: content.FirstContactMessage?.EventAtUTC || null,
            first_member_reply_at: content.FirstMemberReplyMessage?.EventAtUTC || null,
            updated_at: timestamp
          })

        if (chatError) throw new Error(`Chat error: ${chatError.message}`)

        // 8. Insert/Update Message
        const { error: messageError } = await supabase
          .from('messages')
          .upsert({
            id: content.LastMessage.Id,
            chat_id: content.Id,
            contact_id: content.Contact.Id,
            organization_member_id: content.LastMessage.SentByOrganizationMember || null,
            content: content.LastMessage.Content,
            message_type: content.LastMessage.MessageType,
            source: content.LastMessage.Source,
            message_state: content.LastMessage.MessageState,
            is_private: content.LastMessage.IsPrivate,
            event_at_utc: content.LastMessage.EventAtUTC,
            updated_at: timestamp
          })

        if (messageError) throw new Error(`Message error: ${messageError.message}`)

        // Marcar webhook como processado
        await supabase
          .from('webhook_logs')
          .update({ processed: true })
          .eq('event_id', webhookData.EventId)

        console.log(`Webhook ${webhookData.EventId} processado com sucesso`)

      } catch (processingError) {
        console.error('Erro ao processar dados do webhook:', processingError)
        
        // Salvar erro no log
        await supabase
          .from('webhook_logs')
          .update({ 
            processed: false,
            error_message: processingError instanceof Error ? processingError.message : 'Unknown error'
          })
          .eq('event_id', webhookData.EventId)

        throw processingError
      }
    }

    // Resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      eventId: webhookData.EventId
    })

  } catch (error) {
    console.error('Erro geral no webhook:', error)
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao processar webhook'
    })
  }
}

// Configurar CORS
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}