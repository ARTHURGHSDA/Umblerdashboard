import React from 'react'
import { MessageCircle, Webhook, Activity } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Contatos
                </h1>
                <p className="text-sm text-gray-600">
                  Gerenciamento via Webhook
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Webhook className="h-4 w-4" />
              <span>Webhook Ativo</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>Sistema Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}