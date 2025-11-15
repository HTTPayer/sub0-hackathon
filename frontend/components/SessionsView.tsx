'use client'

import React from 'react'
import SessionCard from './SessionCard'
import { Session } from '@/types'

interface SessionsViewProps {
  sessions: Session[]
}

export default function SessionsView({ sessions }: SessionsViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Active Agent Sessions</h2>
      <div className="space-y-3 sm:space-y-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}
