'use client'

import React from 'react'
import { Shield } from 'lucide-react'

export default function HackathonBanner() {
  return (
    <div className="bg-gradient-to-r from-pink-50 to-pink-50 border border-pink-200 mt-10 rounded-lg p-4 sm:p-6 mb-8 sm:mb-12">
      <div className="flex items-start space-x-3">
        <Shield className="text-black-600 flex-shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-semibold text-lg mb-2">Polkadot Hackathon Demo</h3>
          <p className="text-sm text-gray-700 mb-3">
            This proof-of-concept demonstrates agent-native infrastructure: AI agents discover capabilities on Spuro,
            purchase them via HTTPayer (x402), and use them to monitor Polkadot stash accounts without wallets or gas fees.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-black-100 text-black-800 px-2 py-1 rounded text-xs">Arkiv + HTTPayer</span>
            <span className="bg-black-100 text-black-800 px-2 py-1 rounded text-xs">PAPI Integration</span>
            <span className="bg-black-100 text-black-800 px-2 py-1 rounded text-xs">x402 Payments</span>
          </div>
        </div>
      </div>
    </div>
  )
}
