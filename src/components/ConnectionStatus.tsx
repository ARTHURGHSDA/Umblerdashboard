import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase
        .from('organizations')
        .select('count', { count: 'exact', head: true })

      if (error) {
        setError(error.message)
        setIsConnected(false)
      } else {
        setIsConnected(true)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setIsConnected(false)
    }
  }

  if (isConnected === null) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Verificando conexão...</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <WifiOff className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Erro de Conexão com Supabase
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error || 'Não foi possível conectar ao banco de dados'}
            </p>
            <div className="mt-3">
              <button
                onClick={checkConnection}
                className="text-sm text-red-800 hover:text-red-900 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600">
      <Wifi className="h-4 w-4" />
      <span>Conectado ao Supabase</span>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    </div>
  )
}