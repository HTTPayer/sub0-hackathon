# Spuro Functions SDK

Lightweight TypeScript SDK for the Spuro backend API. Provides simple, functional wrappers around backend endpoints with support for any fetch client.

## Features

- Simple functional API - just pass your fetch client
- Full TypeScript support with comprehensive types
- Works with native `fetch`, `x402-fetch`, or any fetch-compatible client
- Zero dependencies (except for your chosen fetch client)
- Helper utilities for payload encoding/decoding

## Installation

### From npm (when published)

```bash
npm install spuro-functions

# Optional: For x402 payment support
npm install x402-fetch viem
```

### From local path (before publishing)

Install directly from the local package directory:

```bash
# In your project
npm install /path/to/spuro-functions

# Or using relative path
npm install ../../packages/ts
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "spuro-functions": "file:../packages/ts"
  }
}
```

## Quick Start

### With x402-fetch (for paid endpoints)

```typescript
import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createEntity, readEntity, encodePayload } from "spuro-functions";

// Setup wallet
const account = privateKeyToAccount("0x...");
const client = createWalletClient({
  account,
  transport: http("https://sepolia.base.org"),
  chain: baseSepolia,
});

// Wrap fetch with payment
const fetchWithPay = wrapFetchWithPayment(fetch, client);

// Use the SDK
const response = await createEntity(fetchWithPay, "http://localhost:8000", {
  payload: encodePayload("Hello World"),
  content_type: "text/plain",
  attributes: { type: "greeting" },
});
```

### With native fetch

```typescript
import { createEntity, encodePayload } from "spuro-functions";

// Use native fetch directly
const response = await createEntity(fetch, "http://localhost:8000", {
  payload: encodePayload("Hello World"),
  content_type: "text/plain",
});
```

## API Reference

All functions follow the same pattern: `(fetchClient, baseUrl, ...params)`

### `createEntity`

Create a new entity.

```typescript
const response = await createEntity(fetchClient, baseUrl, {
  payload: encodePayload("data"),
  content_type: "text/plain",
  attributes: { key: "value" },
  ttl: 86400, // optional, defaults to 86400 (1 day)
});
// Returns: { entity_key: string, tx_hash: string }
```

### `readEntity`

Read an entity by key.

```typescript
const response = await readEntity(fetchClient, baseUrl, entityKey);
// Returns: { data: string, entity: { key, owner, content_type, attributes } }
```

### `updateEntity`

Update an existing entity.

```typescript
const response = await updateEntity(fetchClient, baseUrl, entityKey, {
  payload: encodePayload("new data"), // optional
  attributes: { updated: true }, // optional
  ttl: 172800, // optional
});
// Returns: { status: string, entity_key: string, tx_hash: string }
```

### `deleteEntity`

Delete an entity.

```typescript
const response = await deleteEntity(fetchClient, baseUrl, entityKey);
// Returns: { status: string, entity_key: string, tx_hash: string }
```

### `queryEntities`

Query entities with a query string.

```typescript
const response = await queryEntities(fetchClient, baseUrl, {
  query: 'type = "greeting"',
  limit: 10, // optional, defaults to 20
  include_payload: false, // optional, defaults to false
});
// Returns: { query: string, count: number, results: QueryResult[] }
```

### `transferEntity`

Transfer entity ownership.

```typescript
const response = await transferEntity(fetchClient, baseUrl, {
  entity_key: entityKey,
  new_owner: "0x...",
});
// Returns: { status, entity_key, old_owner, new_owner, tx_hash }
```

## Utility Functions

### `encodePayload(text: string): string`

Encode a string to hex format for use as payload.

```typescript
const hex = encodePayload("Hello World");
// Returns: "48656c6c6f20576f726c64"
```

### `decodePayload(hex: string): string`

Decode a hex payload back to string.

```typescript
const text = decodePayload("48656c6c6f20576f726c64");
// Returns: "Hello World"
```

## Query Language

The `queryEntities` function supports a simple query language:

```typescript
// Equality
await queryEntities(fetch, url, { query: 'type = "user"' });

// Comparison
await queryEntities(fetch, url, { query: "age > 25" });
await queryEntities(fetch, url, { query: "age >= 30" });

// Logical operators
await queryEntities(fetch, url, {
  query: 'type = "user" AND age >= 30',
});
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the SDK
npm run build
```

### Running the Example

The example demonstrates how to use the SDK with x402-fetch for paid API calls.

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables** in `.env`:
   ```env
   API_BASE_URL=http://localhost:8000
   PRIVATE_KEY=your_private_key_here
   RPC_URL=https://sepolia.base.org
   ```

3. **Run the example**:
   ```bash
   npm run example
   ```

### Example Code

See `examples/basic-usage.ts` for complete working examples including:

- Basic CRUD operations
- Batch operations
- Query filtering
- Using with x402-fetch vs native fetch

### Build Commands

- `npm run build` - Build the SDK for distribution
- `npm run dev` - Build in watch mode (for development)
- `npm run example` - Run the example code

## TypeScript Support

All functions are fully typed. Import types as needed:

```typescript
import type {
  CreateEntityParams,
  CreateEntityResponse,
  QueryEntitiesParams,
  QueryEntitiesResponse,
  // ... etc
} from "spuro-functions";
```

## Error Handling

All functions throw errors with descriptive messages on failure:

```typescript
try {
  await createEntity(fetch, url, params);
} catch (error) {
  console.error("Failed to create entity:", error.message);
}
```

## License

MIT
