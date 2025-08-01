import React from 'react'
import { Header } from './components/Header'
import { MetricsCards } from './components/MetricsCards'
import { ContactList } from './components/ContactList'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard de Contatos
          </h2>
          <p className="text-gray-600">
            Gerencie todos os contatos recebidos via webhook do Umbler em tempo real.
          </p>
        </div>

        <MetricsCards />
        <ContactList />
      </main>
    </div>
  )
}

export default App