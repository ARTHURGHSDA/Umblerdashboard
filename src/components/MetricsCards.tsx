import React from 'react'
import { useMetrics } from '../hooks/useMetrics'
import { Users, MessageCircle, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react'

export function MetricsCards() {
  const { metrics, loading } = useMetrics()

  const cards = [
    {
      title: 'Total de Contatos',
      value: metrics.totalContacts,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12% este mês'
    },
    {
      title: 'Chats Ativos',
      value: metrics.activeChats,
      icon: MessageCircle,
      color: 'bg-green-500',
      change: `${metrics.waitingChats} aguardando`
    },
    {
      title: 'Tempo Médio de Resposta',
      value: `${metrics.avgResponseTime}min`,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-5min desde ontem'
    },
    {
      title: 'Total de Mensagens',
      value: metrics.totalMessages,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: `${metrics.todayMessages} hoje`
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.change}</p>
          </div>
        )
      })}
    </div>
  )
}