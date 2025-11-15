"use client"

import React from 'react'
import { Search } from 'lucide-react'
import { useTab } from './TabProvider'

export default function Header() {
  const { activeTab, setActiveTab } = useTab()
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Spuro</h1>
            <p className="text-xs text-gray-500">Powered by HTTPayer</p>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search capabilities..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
        <nav className="flex space-x-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`whitespace-nowrap text-sm ${
              activeTab === 'marketplace' ? 'text-pink-600 font-medium' : 'text-gray-600'
            }`}
          >
            Marketplace
          </button>
          <button className="whitespace-nowrap text-sm text-gray-600">Docs</button>
          <button className="whitespace-nowrap text-sm text-gray-600">Dashboard</button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`whitespace-nowrap text-sm ${
              activeTab === 'sessions' ? 'text-pink-600 font-medium' : 'text-gray-600'
            }`}
          >
            Sessions
          </button>
        </nav>
      </div>
    </header>
  )
}
