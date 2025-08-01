import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Metrics } from '../types'

// Métricas de exemplo
const mockMetrics: Metrics = {
  totalContacts: 2,
  activeChats: 1,
  waitingChats: 1,
  totalMessages: 4,
  avgResponseTime: 8.5,
  todayMessages: 2
}

function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalContacts: 0,
    activeChats: 0,
    waitingChats: 0,
    totalMessages: 0,
    avgResponseTime: 0,
    todayMessages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setError(null)
      
      // Se Supabase não estiver configurado, usar dados de exemplo
      if (!isSupabaseConfigured()) {
        console.log('🔧 Supabase não configurado - usando métricas de exemplo')
        setMetrics(mockMetrics)
        setLoading(false)
        return
      }

      // Get total contacts
      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })

      // Get active chats
      const { count: activeChats } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('is_open', true)

      // Get waiting chats  
      const { count: waitingChats } = await supabase
        .from('chats')  
        .select('*', { count: 'exact', head: true })
        .eq('is_waiting', true)

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      // Get today's messages
      const today = new Date().toISOString().split('T')[0]
      const { count: todayMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      // Calculate average response time
      const { data: responseData } = await supabase
        .from('chats')
        .select('first_contact_message_at, first_member_reply_at')
        .not('first_contact_message_at', 'is', null)
        .not('first_member_reply_at', 'is', null)

      let avgResponseTime = 0
      if (responseData && responseData.length > 0) {
        const responseTimes = responseData.map(chat => {
          const contactTime = new Date(chat.first_contact_message_at!).getTime()
          const replyTime = new Date(chat.first_member_reply_at!).getTime()
          return (replyTime - contactTime) / 1000 / 60 // minutes
        })
        avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      }

      setMetrics({
        totalContacts: totalContacts || 0,
        activeChats: activeChats || 0,
        waitingChats: waitingChats || 0,
        totalMessages: totalMessages || 0,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        todayMessages: todayMessages || 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas')
      console.error('Erro no useMetrics:', err)
      
      // Em caso de erro, usar dados de exemplo
      console.log('🔄 Usando métricas de exemplo devido ao erro')
      setMetrics(mockMetrics)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    // Só configurar polling se Supabase estiver configurado
    if (!isSupabaseConfigured()) {
      return
    }

    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  return { metrics, loading, error, refetch: fetchMetrics }
}