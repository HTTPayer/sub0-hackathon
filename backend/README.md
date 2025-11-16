# ArkiVendor Backend

FastAPI server providing HTTP endpoints for Arkiv blockchain storage with X402 payment integration.

## Deployed Instance

Live API: https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/

API Documentation: https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/docs

## Deployed Addresses

Arkiv wallet: 0xe68CAA089273F3F7033075f2bDc715F908f47bDB

Base-Sepolia wallet (x402 recipient): 0xbd3461330f3a42583127bdb0f72652fcc9259992

## What's Included

**API Server (Python/FastAPI)**
- `main.py` - FastAPI application with entity CRUD operations
- X402 payment middleware for monetized API access
- Arkiv SDK integration for blockchain storage

**Test Client (TypeScript)**
- `test-client.ts` - Comprehensive test suite using X402 payments
- Tests all endpoints with real payment flow
- Uses viem for wallet management

**Interactive CLI (TypeScript)**
- `arkivendor.ts` - Interactive shell for entity management
- Command-line interface for all operations

## Requirements

- Python 3.13+
- Node.js 20+
- uv (Python package manager)
- Arkiv private key for backend operations
- Client private key with Base Sepolia ETH for testing

## Configuration

Create a `.env` file:

```bash
# API Configuration
API_BASE_URL=http://localhost:8000

# Backend Arkiv Configuration
ARKIV_PRIVATE_KEY=your_backend_private_key
ARKIV_RPC_URL=https://mendoza.hoodi.arkiv.network/rpc
ARKIV_ACCOUNT_ADDRESS=your_account_address

# X402 Payment Configuration
PAYTO_ADDRESS=your_payment_address
API_COST=0.01
MAINNET=false

# Test Client Configuration
CLIENT_PRIVATE_KEY=your_client_private_key
RPC_URL=https://sepolia.base.org
TRANSFER_TO_ADDRESS=0x... # Optional for ownership transfer tests
```

## Running the Server

Install Python dependencies:

```bash
uv sync
```

Start the FastAPI server:

```bash
uv run uvicorn main:app --reload
```

The server will run at `http://localhost:8000`

API documentation available at `http://localhost:8000/docs`

## Running the Test Client

Install Node.js dependencies:

```bash
npm install
```

Run the test suite:

```bash
npm test
```

This will:
- Create entities with X402 payment
- Read, update, and delete entities
- Query entities with various filters
- Test ownership transfer
- Clean up all test data

## API Endpoints

All endpoints except `/` require X402 payment.

- `GET /` - Health check
- `POST /entities` - Create entity
- `GET /entities/{key}` - Read entity
- `PUT /entities/{key}` - Update entity
- `DELETE /entities/{key}` - Delete entity
- `GET /entities/query` - Query entities
- `POST /entities/transfer` - Transfer ownership

## Interactive CLI

Build and run the interactive shell:

```bash
npm run build
npm start
```

Or in development mode:

```bash
npm run dev
```

Available commands:
- `create <payload> [--attributes <json>]`
- `read <entity_key|last>`
- `update <entity_key|last> [--payload] [--attributes]`
- `delete <entity_key|last>`
- `query <query_string> [--limit] [--payload]`
- `transfer <entity_key|last> <new_owner>`
- `status`, `history`, `help`, `exit`

## Development

Watch mode for TypeScript:

```bash
npm run watch
```

Run server with debug logging:

```bash
uv run uvicorn main:app --reload --log-level debug
```

## Project Structure

```
backend/
├── main.py              # FastAPI server
├── test-client.ts       # Test suite
├── arkivendor.ts        # Interactive CLI
├── pyproject.toml       # Python dependencies
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript config
├── .env.example         # Environment template
└── tests/               # Arkiv SDK test scripts
```

## License

TBA
