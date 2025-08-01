import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Webhook payload interface
const sampleUmblerPayload = {
  "Type": "Message",
  "EventDate": new Date().toISOString(),
  "Payload": {
    "Type": "Chat",
    "Content": {
      "Organization": {
        "Id": "org_dev_123"
      },
      "Contact": {
        "Id": "contact_dev_" + Date.now(),
        "Name": "João Silva (DEV)",
        "PhoneNumber": "+5511999999999",
        "ProfilePictureUrl": "https://example.com/avatar.jpg",
        "IsBlocked": false,
        "LastActiveUTC": new Date().toISOString(),
        "ContactType": "DirectMessage",
        "Tags": [
          {
            "Id": "tag_dev_1",
            "Name": "Cliente VIP"
          },
          {
            "Id": "tag_dev_2", 
            "Name": "Desenvolvimento"
          }
        ]
      },
      "Channel": {
        "Id": "channel_dev_whatsapp",
        "Name": "WhatsApp Business DEV",
        "PhoneNumber": "+5511888888888",
        "ChannelType": "WhatsApp"
      },
      "Sector": {
        "Id": "sector_dev_support",
        "Name": "Suporte DEV",
        "Default": true,
        "Order": 1
      },
      "OrganizationMember": {
        "Id": "member_dev_001",
        "Muted": false,
        "TotalUnread": 1
      },
      "LastMessage": {
        "Id": "msg_dev_" + Date.now(),
        "Content": "Mensagem de teste do desenvolvimento local",
        "MessageType": "Text",
        "Source": "Contact",
        "MessageState": "Sent",
        "EventAtUTC": new Date().toISOString(),
        "SentByOrganizationMember": null,
        "IsPrivate": false
      },
      "Id": "chat_dev_" + Date.now(),
      "Open": true,
      "Private": false,
      "Waiting": true,
      "WaitingSinceUTC": new Date().toISOString(),
      "TotalUnread": 1,
      "EventAtUTC": new Date().toISOString(),
      "FirstContactMessage": {
        "Id": "msg_dev_" + Date.now(),
        "EventAtUTC": new Date().toISOString()
      },
      "FirstMemberReplyMessage": null,
      "CreatedAtUTC": new Date().toISOString()
    }
  },
  "EventId": "event_dev_" + Date.now()
};

// Webhook handler
async function handleWebhook(req, res) {
  console.log('🔔 Webhook recebido:', {
    method: req.method,
    url: req.url,
    body: req.body ? 'Payload presente' : 'Sem payload'
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔧 Configuração:', {
      supabaseUrl: supabaseUrl ? 'Configurado' : 'FALTANDO',
      serviceKey: supabaseServiceKey ? 'Configurado' : 'FALTANDO'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente faltando');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        details: {
          supabaseUrl: supabaseUrl ? 'OK' : 'MISSING',
          serviceKey: supabaseServiceKey ? 'OK' : 'MISSING'
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const webhookData = req.body;

    // Test Supabase connection first
    console.log('🔍 Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ Erro de conexão com Supabase:', testError);
      return res.status(500).json({
        success: false,
        error: 'Supabase connection failed',
        details: testError
      });
    }

    console.log('✅ Conexão com Supabase OK');

    // Log do webhook recebido
    console.log('💾 Salvando log do webhook...');
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        event_id: webhookData.EventId || 'no-event-id',
        event_type: webhookData.Type || 'unknown',
        event_date: webhookData.EventDate || new Date().toISOString(),
        payload: webhookData,
        processed: false
      });

    if (logError) {
      console.error('⚠️ Erro ao salvar log do webhook:', logError);
    } else {
      console.log('✅ Log do webhook salvo');
    }

    // Processar apenas webhooks do tipo Message com payload Chat
    if (webhookData.Type === 'Message' && webhookData.Payload?.Type === 'Chat') {
      console.log('🔄 Processando webhook de mensagem...');
      const content = webhookData.Payload.Content;
      const timestamp = new Date().toISOString();

      try {
        // 1. Upsert Organization
        console.log('👥 Processando organização...');
        const { error: orgError } = await supabase
          .from('organizations')
          .upsert({
            id: content.Organization.Id,
            name: `Organization ${content.Organization.Id}`,
            updated_at: timestamp
          });

        if (orgError) {
          console.error('❌ Erro na organização:', orgError);
          throw new Error(`Organization error: ${orgError.message}`);
        }

        // 2. Upsert Channel
        console.log('📱 Processando canal...');
        const { error: channelError } = await supabase
          .from('channels')
          .upsert({
            id: content.Channel.Id,
            organization_id: content.Organization.Id,
            channel_type: content.Channel.ChannelType,
            phone_number: content.Channel.PhoneNumber,
            name: content.Channel.Name,
            updated_at: timestamp
          });

        if (channelError) {
          console.error('❌ Erro no canal:', channelError);
          throw new Error(`Channel error: ${channelError.message}`);
        }

        // 3. Upsert Sector
        console.log('🏢 Processando setor...');
        const { error: sectorError } = await supabase
          .from('sectors')
          .upsert({
            id: content.Sector.Id,
            organization_id: content.Organization.Id,
            name: content.Sector.Name,
            is_default: content.Sector.Default,
            order_index: content.Sector.Order,
            updated_at: timestamp
          });

        if (sectorError) {
          console.error('❌ Erro no setor:', sectorError);
          throw new Error(`Sector error: ${sectorError.message}`);
        }

        // 4. Upsert Organization Member
        console.log('👤 Processando membro...');
        const { error: memberError } = await supabase
          .from('organization_members')
          .upsert({
            id: content.OrganizationMember.Id,
            organization_id: content.Organization.Id,
            is_muted: content.OrganizationMember.Muted,
            total_unread: content.OrganizationMember.TotalUnread || 0,
            updated_at: timestamp
          });

        if (memberError) {
          console.error('❌ Erro no membro:', memberError);
          throw new Error(`Member error: ${memberError.message}`);
        }

        // 5. Upsert Contact
        console.log('📞 Processando contato...');
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
          });

        if (contactError) {
          console.error('❌ Erro no contato:', contactError);
          throw new Error(`Contact error: ${contactError.message}`);
        }

        // 6. Processar Tags
        console.log('🏷️ Processando tags...');
        for (const tag of content.Contact.Tags || []) {
          const { error: tagError } = await supabase
            .from('tags')
            .upsert({
              id: tag.Id,
              name: tag.Name,
              color: '#3B82F6',
              updated_at: timestamp
            });

          if (tagError) {
            console.error(`❌ Erro na tag ${tag.Id}:`, tagError);
            continue;
          }

          const { error: contactTagError } = await supabase
            .from('contact_tags')
            .upsert({
              contact_id: content.Contact.Id,
              tag_id: tag.Id
            });

          if (contactTagError) {
            console.error('❌ Erro na relação contact_tag:', contactTagError);
          }
        }

        // 7. Upsert Chat
        console.log('💬 Processando chat...');
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
          });

        if (chatError) {
          console.error('❌ Erro no chat:', chatError);
          throw new Error(`Chat error: ${chatError.message}`);
        }

        // 8. Insert/Update Message
        console.log('💌 Processando mensagem...');
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
          });

        if (messageError) {
          console.error('❌ Erro na mensagem:', messageError);
          throw new Error(`Message error: ${messageError.message}`);
        }

        // Marcar webhook como processado
        console.log('✅ Marcando webhook como processado...');
        await supabase
          .from('webhook_logs')
          .update({ processed: true })
          .eq('event_id', webhookData.EventId);

        console.log(`🎉 Webhook ${webhookData.EventId} processado com sucesso!`);

      } catch (processingError) {
        console.error('❌ Erro ao processar dados do webhook:', processingError);
        
        await supabase
          .from('webhook_logs')
          .update({ 
            processed: false,
            error_message: processingError.message
          })
          .eq('event_id', webhookData.EventId);

        throw processingError;
      }
    } else {
      console.log('⚠️ Webhook ignorado - tipo não suportado:', webhookData.Type);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      eventId: webhookData.EventId
    });

  } catch (error) {
    console.error('💥 Erro geral no webhook:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro ao processar webhook'
    });
  }
}

// Routes
app.post('/api/webhook', handleWebhook);

app.post('/api/test-webhook', async (req, res) => {
  console.log('🧪 Executando teste do webhook...');
  
  try {
    const response = await fetch(`http://localhost:${PORT}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleUmblerPayload)
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({
        success: true,
        message: 'Teste do webhook executado com sucesso!',
        webhookResponse: result,
        testData: {
          eventId: sampleUmblerPayload.EventId,
          contactName: sampleUmblerPayload.Payload.Content.Contact.Name,
          messageContent: sampleUmblerPayload.Payload.Content.LastMessage.Content
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro no teste do webhook',
        error: result,
        webhookStatus: response.status
      });
    }

  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha ao executar teste do webhook'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: process.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando na porta ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/api/webhook`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test-webhook`);
});