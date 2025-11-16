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
    name: 'Arkivolts for snapshots',
    provider: 'Arkivendor',
    category: 'Memory',
    description:
      'Client-side functions (arkivolts) used by the AI‑rkiv CLI to call Arkivendor: createEntity, readEntity, queryEntities, and snapshotStashToArkiv. These wrap the Arkivendor HTTP API and are paid via x402/httpayer.',
    pricing: { write: 0.0001, read: 0.00005 },
    estimate: 'Example pricing only – see backend config for real values',
    uptime: 'FastAPI + Arkiv',
    users: 'Used by AI‑rkiv demo agent',
    features: [
      'createEntity / readEntity / queryEntities helpers',
      'optional snapshotStashToArkiv orchestration',
      'x402/httpayer integration at the HTTP layer'
    ],
    integration: `// Example TypeScript SDK layer (arkivolts.ts)
import { ArkivClient } from './arkiv-client'

export async function createEntity(payload: string, attributes: any = {}) {
  return ArkivClient.post('/entities', { payload, attributes, ttl: 86400 })
}

export async function readEntity(entityKey: string) {
  return ArkivClient.get(\`/entities/\${entityKey}\`)
}

export async function queryEntities(query: string, limit = 10) {
  return ArkivClient.get('/entities/query', { query, limit })
}

// High-level helper used by AI‑rkiv:
// snapshotStashToArkiv(stashAddress) -> creates a snapshot via PAPI + createEntity()`
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
