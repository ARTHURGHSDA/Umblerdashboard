import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastWebhookLog, setLastWebhookLog] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Test Supabase connection
      const { data, error: connectionError } = await supabase
        .from('contacts')
        .select('count', { count: 'exact', head: true })

      if (connectionError) {
        throw connectionError
      }

      // Get last webhook log
      const { data: webhookData, error: webhookError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (webhookError && webhookError.code !== 'PGRST116') {
        console.warn('Erro ao buscar logs do webhook:', webhookError)
      } else if (webhookData) {
        setLastWebhookLog(webhookData)
      }

      setIsConnected(true)
    } catch (err) {
      console.error('Erro de conexão:', err)
      setError(err instanceof Error ? err.message : 'Erro de conexão')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhook = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (response.ok) {
        alert('Teste do webhook executado com sucesso!\n\n' + 
              `Event ID: ${result.testData?.eventId}\n` +
              `Contato: ${result.testData?.contactName}\n` +
              `Mensagem: ${result.testData?.messageContent}`)
        
        // Refresh connection status
        setTimeout(checkConnection, 2000)
      } else {
        alert('Erro no teste do webhook:\n' + JSON.stringify(result.error, null, 2))
      }
    } catch (error) {
      alert('Erro ao testar webhook:\n' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-600'
    if (error) return 'text-red-600'
    return isConnected ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />
    if (error) return <AlertCircle className="h-5 w-5" />
    return isConnected ? <CheckCircle className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />
  }

  const getStatusText = () => {
    if (isLoading) return 'Verificando conexão...'
    if (error) return `Erro: ${error}`
    return isConnected ? 'Conectado ao Supabase' : 'Desconectado'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Status da Conexão
            </h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wifi className="h-3 w-3 mr-1" />}
            Verificar
          </button>

          <button
            onClick={testWebhook}
            disabled={isLoading || !isConnected}
            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
            Testar Webhook
          </button>
        </div>
      </div>

      {lastWebhookLog && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-500">Último webhook:</span>
              <span className="ml-2 font-medium text-gray-900">
                {lastWebhookLog.event_type}
              </span>
              {lastWebhookLog.processed ? (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Processado
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pendente
                </span>
              )}
            </div>
            <span className="text-gray-500">
              {formatDate(lastWebhookLog.created_at)}
            </span>
          </div>
          
          {lastWebhookLog.error_message && (
            <div className="mt-2 text-sm text-red-600">
              <strong>Erro:</strong> {lastWebhookLog.error_message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}