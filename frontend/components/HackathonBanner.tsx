'use client'

import React from 'react'
import { Shield } from 'lucide-react'

export default function HackathonBanner() {
  return (
    <div className="bg-gradient-to-r from-pink-50 to-pink-50 border border-pink-200 mt-10 rounded-lg p-4 sm:p-6 mb-8 sm:mb-12">
      <div className="flex items-start space-x-3">
        <Shield className="text-black-600 flex-shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-semibold text-lg mb-2">sub0 Hackathon Demo</h3>
          <p className="text-sm text-gray-700 mb-3">
            This proof-of-concept demonstrates agent-native infrastructure: AI agents buy Arkiv-backed memory
            buckets on Spuro via HTTPayer (x402), then an external agent (e.g. ai-rkiv) queries Polkadot via PAPI
            and persists stash-account snapshots into that paid memory layer.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-black-100 text-black-800 px-2 py-1 rounded text-xs">Arkiv Memory Bucket</span>
            <span className="bg-black-100 text-black-800 px-2 py-1 rounded text-xs">HTTPayer x402</span>
            <span className="bg-black-100 text-black-800 px-2 py-1 rounded text-xs">PAPI (external)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
