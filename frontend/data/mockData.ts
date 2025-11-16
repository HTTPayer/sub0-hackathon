import { Database, Shield, Wrench, Zap } from 'lucide-react'
import { Category, Product, Session } from '@/types'

export const categories: Category[] = [
  { name: 'Memory', icon: Database, count: 1 },
  { name: 'Blockchain Data', icon: Shield, count: 0 },
  { name: 'Tools', icon: Wrench, count: 0 },
  { name: 'APIs', icon: Zap, count: 0 }
]

export const products: Product[] = [
  {
    id: 1,
    name: 'Memory Bucket',
    provider: 'Arkivendor',
    category: 'Memory',
    description:
      'Persistent encrypted memory for agent state with configurable TTL. Powered by Arkiv SDK and protected by x402 via HTTPayer. Used in the demo as the paid memory layer for Polkadot stash-account snapshots (queried externally via PAPI).',
    pricing: { write: 0.0001, read: 0.00005 },
    estimate: '$12/mo for 100k writes, 50k reads',
    uptime: '99.9%',
    users: '2.4k agents',
    features: ['Configurable TTL', 'x402 protected', 'HTTPayer enabled'],
    integration: `// Install: npm install @arkivendor/sdk httplayer

const arkiv = await ArkivendorSDK.bucket("standard", {
  apiKey: process.env.ARKIV_KEY,
  ttl: 86400 // 24 hour TTL
});

// Write snapshot (HTTPayer handles 402 payment)
await arkiv.write("polkadot:stash:14Gj...", {
  balance: "1000000000000",
  timestamp: Date.now()
});

// Read previous snapshot
const prev = await arkiv.read("polkadot:stash:14Gj...");`
  }
]

export const sessions: Session[] = [
  {
    id: 'ai-rkiv-prod-7x4k',
    created: '2h ago',
    spent: 3.42,
    capabilities: ['Memory Bucket']
  },
  {
    id: 'test-monitor-3m9p',
    created: '1d ago',
    spent: 0.89,
    capabilities: ['Memory Bucket']
  }
]
