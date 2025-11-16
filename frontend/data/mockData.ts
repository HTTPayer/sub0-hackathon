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
    name: 'Spuro Functions SDK',
    provider: 'Spuro',
    category: 'Memory',
    description:
      'Lightweight TypeScript SDK providing functional wrappers around Spuro backend endpoints. Includes createEntity, readEntity, updateEntity, deleteEntity, queryEntities, and transferEntity. Works with any fetch client (native fetch, x402-fetch, etc.) and handles payload encoding/decoding.',
    pricing: { perCall: 0.01 },
    estimate: '0.01 ETH per API call (configurable via API_COST)',
    uptime: 'FastAPI + Arkiv',
    users: 'Used by AI-Spuro demo agent',
    features: [
      'createEntity / readEntity / updateEntity / deleteEntity',
      'queryEntities with attribute-based filtering',
      'transferEntity for ownership changes',
      'encodePayload / decodePayload utilities',
      'x402/HTTPayer integration via fetch client',
      'Zero runtime dependencies (bring your own fetch)'
    ],
    integration: `// Install from local path
npm install ../../packages/ts

// Setup with x402-fetch for paid endpoints
import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import {
  createEntity,
  readEntity,
  queryEntities,
  encodePayload,
  decodePayload,
} from "spuro-functions";

// Setup wallet client
const account = privateKeyToAccount("0x...");
const client = createWalletClient({
  account,
  transport: http("https://sepolia.base.org"),
  chain: baseSepolia,
});

// Wrap fetch with payment handling
const fetchWithPay = wrapFetchWithPayment(fetch, client);

// Create an entity
const response = await createEntity(fetchWithPay, "http://localhost:8000", {
  payload: encodePayload("Hello World"),
  content_type: "text/plain",
  attributes: { type: "greeting", timestamp: Date.now() },
  ttl: 86400, // 1 day
});

// Read an entity
const entity = await readEntity(
  fetchWithPay,
  "http://localhost:8000",
  response.entity_key
);
console.log(decodePayload(entity.data));

// Query entities
const results = await queryEntities(fetchWithPay, "http://localhost:8000", {
  query: 'type = "greeting"',
  limit: 10,
  include_payload: false,
});`
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
