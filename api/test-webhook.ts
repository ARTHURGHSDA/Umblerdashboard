import type { VercelRequest, VercelResponse } from '@vercel/node'

// Payload de exemplo do Umbler Talk para testes
const sampleUmblerPayload = {
  "Type": "Message",
  "EventDate": "2024-01-15T10:30:00Z",
  "Payload": {
    "Type": "Chat",
    "Content": {
      "Organization": {
        "Id": "org_123456"
      },
      "Contact": {
        "Id": "contact_789",
        "Name": "João Silva",
        "PhoneNumber": "+5511999999999",
        "ProfilePictureUrl": "https://example.com/avatar.jpg",
        "IsBlocked": false,
        "LastActiveUTC": "2024-01-15T10:29:00Z",
        "ContactType": "DirectMessage",
        "Tags": [
          {
            "Id": "tag_1",
            "Name": "Cliente VIP"
          },
          {
            "Id": "tag_2", 
            "Name": "Suporte"
          }
        ]
      },
      "Channel": {
        "Id": "channel_whatsapp_001",
        "Name": "WhatsApp Business",
        "PhoneNumber": "+5511888888888",
        "ChannelType": "WhatsApp"
      },
      "Sector": {
        "Id": "sector_support",
        "Name": "Suporte Técnico",
        "Default": true,
        "Order": 1
      },
      "OrganizationMember": {
        "Id": "member_001",
        "Muted": false,
        "TotalUnread": 2
      },
      "LastMessage": {
        "Id": "msg_12345",
        "Content": "Olá, preciso de ajuda com meu pedido",
        "MessageType": "Text",
        "Source": "Contact",
        "MessageState": "Sent",
        "EventAtUTC": "2024-01-15T10:30:00Z",
        "SentByOrganizationMember": null,
        "IsPrivate": false
      },
      "Id": "chat_456789",
      "Open": true,
      "Private": false,
      "Waiting": true,
      "WaitingSinceUTC": "2024-01-15T10:30:00Z",
      "TotalUnread": 1,
      "EventAtUTC": "2024-01-15T10:30:00Z",
      "FirstContactMessage": {
        "Id": "msg_12345",
        "EventAtUTC": "2024-01-15T10:30:00Z"
      },
      "FirstMemberReplyMessage": null,
      "CreatedAtUTC": "2024-01-15T10:30:00Z"
    }
  },
  "EventId": "event_test_" + Date.now()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST to test webhook.' 
    })
  }

  try {
    console.log('Testando webhook com dados de exemplo...')

    // Fazer requisição para o endpoint principal do webhook
    const webhookUrl = req.headers.host 
      ? `https://${req.headers.host}/api/webhook`
      : 'http://localhost:3000/api/webhook'

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleUmblerPayload)
    })

    const result = await response.json()

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Teste do webhook executado com sucesso!',
        webhookResponse: result,
        testData: {
          eventId: sampleUmblerPayload.EventId,
          contactName: sampleUmblerPayload.Payload.Content.Contact.Name,
          messageContent: sampleUmblerPayload.Payload.Content.LastMessage.Content
        }
      })
    } else {
      return res.status(500).json({
        success: false,
        message: 'Erro no teste do webhook',
        error: result,
        webhookStatus: response.status
      })
    }

  } catch (error) {
    console.error('Erro ao testar webhook:', error)
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Falha ao executar teste do webhook'
    })
  }
}

// Configurações da API
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}