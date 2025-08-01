import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WebhookPayload {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const webhookData: WebhookPayload = await req.json()
    
    // Log webhook recebido
    await supabaseClient
      .from('webhook_logs')
      .insert({
        event_id: webhookData.EventId,
        event_type: webhookData.Type,
        event_date: webhookData.EventDate,
        payload: webhookData,
        processed: false
      })

    if (webhookData.Type === 'Message' && webhookData.Payload.Type === 'Chat') {
      const content = webhookData.Payload.Content
      
      // 1. Upsert Organization
      await supabaseClient
        .from('organizations')
        .upsert({
          id: content.Organization.Id,
          name: 'Organization ' + content.Organization.Id,
          updated_at: new Date().toISOString()
        })

      // 2. Upsert Channel
      await supabaseClient
        .from('channels')
        .upsert({
          id: content.Channel.Id,
          organization_id: content.Organization.Id,
          channel_type: content.Channel.ChannelType,
          phone_number: content.Channel.PhoneNumber,
          name: content.Channel.Name,
          updated_at: new Date().toISOString()
        })

      // 3. Upsert Sector
      await supabaseClient
        .from('sectors')
        .upsert({
          id: content.Sector.Id,
          organization_id: content.Organization.Id,
          name: content.Sector.Name,
          is_default: content.Sector.Default,
          order_index: content.Sector.Order,
          updated_at: new Date().toISOString()
        })

      // 4. Upsert Organization Member
      await supabaseClient
        .from('organization_members')
        .upsert({
          id: content.OrganizationMember.Id,
          organization_id: content.Organization.Id,
          is_muted: content.OrganizationMember.Muted,
          total_unread: content.OrganizationMember.TotalUnread || 0,
          updated_at: new Date().toISOString()
        })

      // 5. Upsert Contact
      await supabaseClient
        .from('contacts')
        .upsert({
          id: content.Contact.Id,
          organization_id: content.Organization.Id,
          name: content.Contact.Name,
          phone_number: content.Contact.PhoneNumber,
          profile_picture_url: content.Contact.ProfilePictureUrl,
          is_blocked: content.Contact.IsBlocked,
          last_active_utc: content.Contact.LastActiveUTC,
          contact_type: content.Contact.ContactType,
          updated_at: new Date().toISOString()
        })

      // 6. Upsert Tags and Contact Tags
      for (const tag of content.Contact.Tags) {
        await supabaseClient
          .from('tags')
          .upsert({
            id: tag.Id,
            name: tag.Name,
            updated_at: new Date().toISOString()
          })

        await supabaseClient
          .from('contact_tags')
          .upsert({
            contact_id: content.Contact.Id,
            tag_id: tag.Id
          })
      }

      // 7. Upsert Chat
      await supabaseClient
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
          waiting_since_utc: content.WaitingSinceUTC,
          total_unread: content.TotalUnread,
          first_contact_message_id: content.FirstContactMessage?.Id,
          first_member_reply_id: content.FirstMemberReplyMessage?.Id,
          first_contact_message_at: content.FirstContactMessage?.EventAtUTC,
          first_member_reply_at: content.FirstMemberReplyMessage?.EventAtUTC,
          updated_at: new Date().toISOString()
        })

      // 8. Insert Message
      await supabaseClient
        .from('messages')
        .upsert({
          id: content.LastMessage.Id,
          chat_id: content.Id,
          contact_id: content.Contact.Id,
          organization_member_id: content.LastMessage.SentByOrganizationMember,
          content: content.LastMessage.Content,
          message_type: content.LastMessage.MessageType,
          source: content.LastMessage.Source,
          message_state: content.LastMessage.MessageState,
          is_private: content.LastMessage.IsPrivate,
          event_at_utc: content.LastMessage.EventAtUTC,
          updated_at: new Date().toISOString()
        })

      // Mark webhook as processed
      await supabaseClient
        .from('webhook_logs')
        .update({ processed: true })
        .eq('event_id', webhookData.EventId)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Error processing webhook'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})