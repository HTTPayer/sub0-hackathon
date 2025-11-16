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
    name: 'Spuro Functions for snapshots',
    provider: 'Spuro',
    category: 'Memory',
    description:
      'Client-side Spuro Functions used by the AI-Spuro CLI to call Spuro: createEntity, readEntity, queryEntities, and snapshotStashToArkiv. These wrap the Spuro HTTP API and are paid via x402/HTTPayer.',
    pricing: { write: 0.0001, read: 0.00005 },
    estimate: 'Example pricing only – see backend config for real values',
    uptime: 'FastAPI + Arkiv',
    users: 'Used by AI-Spuro demo agent',
    features: [
      'createEntity / readEntity / queryEntities helpers',
      'optional snapshotStashToArkiv orchestration',
      'x402/HTTPayer integration at the HTTP layer'
    ],
    integration: `// Example TypeScript SDK layer (spuro-functions.ts)
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

// High-level helper used by AI-Spuro:
// snapshotStashToArkiv(stashAddress) -> creates a snapshot via PAPI + createEntity()`
  }
]

export const sessions: Session[] = [
  {
    id: 'ai-spuro-prod-7x4k',
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
