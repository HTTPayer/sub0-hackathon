'use client'

import React from 'react'
import { Session } from '@/types'

interface SessionCardProps {
  session: Session
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg mb-2 break-all">Session: {session.id}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            Created: {session.created} • Spent: ${session.spent.toFixed(2)}
          </p>
          <div className="flex items-start sm:items-center space-x-2 flex-wrap gap-1">
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Capabilities:</span>
            {session.capabilities.map((cap) => (
              <span key={cap} className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                {cap}
              </span>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 sm:px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm whitespace-nowrap">
            View Logs
          </button>
          <button className="px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs sm:text-sm whitespace-nowrap">
            Revoke
          </button>
        </div>
      </div>
    </div>
  )
}
