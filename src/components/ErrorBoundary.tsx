import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Erro na Aplicação
            </h1>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Verifique se as variáveis de ambiente do Supabase estão configuradas corretamente.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Página
              </button>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Variáveis necessárias:</p>
                <p>VITE_SUPABASE_URL</p>
                <p>VITE_SUPABASE_ANON_KEY</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}