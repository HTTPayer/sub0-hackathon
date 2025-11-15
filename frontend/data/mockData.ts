import { Database, Shield, Wrench, Zap } from 'lucide-react'
import { Category, Product, Session } from '@/types'

export const categories: Category[] = [
  { name: 'Memory', icon: Database, count: 2 },
  { name: 'Blockchain Data', icon: Shield, count: 3 },
  { name: 'Tools', icon: Wrench, count: 5 },
  { name: 'APIs', icon: Zap, count: 8 }
]

export const products: Product[] = [
  {
    id: 1,
    name: 'Memory Bucket: Arkiv Standard',
    provider: 'Arkivendor',
    category: 'Memory',
    description: 'Persistent encrypted memory for agent state with configurable TTL. Powered by Arkiv SDK, x402-protected. Perfect for storing blockchain snapshots, account data, and temporal state.',
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
  },
  {
    id: 2,
    name: 'Polkadot Account Data API',
    provider: 'Arkivendor',
    category: 'Blockchain Data',
    description: 'Query Polkadot system.account data for any stash address via PAPI light-client. Returns balance, nonce, and account info. Pay-per-call pricing with HTTPayer.',
    pricing: { perCall: 0.002 },
    estimate: '$0.002 per query',
    uptime: '99.95%',
    users: '890 agents',
    features: ['PAPI light-client', 'Real-time chain data', 'x402 protected'],
    integration: `// Install: npm install @arkivendor/polkadot httplayer

const api = await ArkivendorSDK.polkadot({
  apiKey: process.env.ARKIV_KEY
});

// Query stash account (HTTPayer handles payment)
const account = await api.getAccount(
  "14GjSBXZKEcBN5vmZH8zYfh3Y3Pc4KKLRZYT8Ea4xmT5DuCQ"
);

console.log(account.data.free); // Free balance
console.log(account.data.reserved); // Reserved balance`
  },
  {
    id: 3,
    name: 'ai-rkiv CLI Agent',
    provider: 'Arkivendor',
    category: 'Tools',
    description: 'TypeScript CLI agent that monitors Polkadot stash accounts, detects balance changes, and persists snapshots to Arkiv. Runs on-demand or scheduled. Fully HTTPayer-enabled.',
    pricing: { base: 5, perRun: 0.01 },
    estimate: '$5/mo + $0.01 per run',
    uptime: '99.8%',
    users: '320 agents',
    features: ['PAPI integration', 'Change detection', 'TTL management'],
    integration: `// Install: npm install -g @arkivendor/ai-rkiv

// Monitor a stash account
ai-rkiv monitor 14GjSBXZKEcBN5vmZH8zYfh3Y3Pc4KKLRZYT8Ea4xmT5DuCQ \\
  --interval 3600 \\
  --ttl 86400 \\
  --alert-threshold 1000000000000

// View change history
ai-rkiv history 14GjSBXZKEcBN5vmZH8zYfh3Y3Pc4KKLRZYT8Ea4xmT5DuCQ`
  }
]

export const sessions: Session[] = [
  { id: 'ai-rkiv-prod-7x4k', created: '2h ago', spent: 3.42, capabilities: ['Memory Bucket', 'Polkadot API'] },
  { id: 'test-monitor-3m9p', created: '1d ago', spent: 0.89, capabilities: ['Memory Bucket'] }
]
