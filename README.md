# Spuro – powered by HTTPayer

Spuro is an agent-powered platform that enables AI agents to persistently store, query, and monitor Polkadot blockchain data using Arkiv (a decentralized storage layer) with automatic TTL-based expiry, while transparently handling micropayments via HTTPayer's x402 protocol. Built with a Python/FastAPI backend, TypeScript/Node.js CLI agent, Next.js documentation frontend, and a TypeScript SDK (spuro-functions), Spuro solves the problem of agents needing cost-efficient, queryable memory without managing wallets or payments directly—it abstracts payment complexity so payments feel like "just HTTP" while enabling real-world use cases like stash account monitoring for Polkadot nominators and validators tracking balances and staking behavior.

- **backend**: [`Spuro` (Arkiv + x402 backend)](backend/README.md)
- **frontend**: [Spuro Docs & Demo (Next.js)](frontend/README.md)
- **cli / agent**: [`AI-Spuro` CLI agent (`cli/`)](cli/README.md)
- **sdk**: [`spuro-functions` TypeScript SDK (`packages/ts`)](packages/ts/README.md)

### Arkiv track overview

This repository is our **Arkiv track** submission for the Sub0 hackathon. The README is structured for judges around three questions: **what Spuro does**, **how to run it**, and **how Arkiv is used** across the stack.

### What Spuro does (Arkiv track)

Spuro is an agent-powered proof-of-concept that demonstrates how AI agents can persist and query Polkadot stash-account data using **Arkiv + HTTPayer + PAPI**:

- **AI agent monitors stash accounts**: The `AI-Spuro` CLI agent connects to Polkadot via PAPI, fetches `system.account` data for a stash address, and detects changes over time.
- **Arkiv-backed memory layer**: The Spuro backend wraps the Arkiv SDK and stores each snapshot as a JSON entity with a **TTL**, so old data expires instead of growing unbounded.
- **x402 payments via HTTPayer**: Arkiv reads/writes are monetized; HTTPayer handles x402 flows so the agent pays per API call while still using simple HTTP.
- **Docs & functions catalogue**: The Spuro Docs frontend documents the API and a small SDK of “Spuro Functions” (`createEntity`, `readEntity`, `queryEntities`, `snapshotStashToArkiv`) that agents can call instead of raw HTTP.

### Architecture & Components

1. **Backend (Spuro - Python/FastAPI):**
   - Wraps Arkiv's SDK behind an x402-protected HTTP API.
   - Supports storing and retrieving JSON-encoded "snapshot" objects (e.g. Polkadot account info) with a TTL, so old data expires.
   - HTTPayer is used to handle x402 payments: when the AI-Spuro CLI agent calls this API, HTTPayer intercepts the 402, pays, and retries.
   - Spuro is responsible for Arkiv-backed memory and generic entity CRUD/query operations.
2. **Docs Frontend (Spuro Docs - Next.js):**
   - A Next.js 16 site that documents Spuro&apos;s endpoints and the client-side SDK layer (Spuro Functions) used by agents.
   - Shows an overview of the core API (`/entities`, `/entities/{key}`, `/entities/query`, `/entities/transfer`) and how they are combined into Spuro Functions.
   - Includes a catalogue-style view of these Spuro Functions (e.g. `createEntity`, `readEntity`, `queryEntities`, `snapshotStashToArkiv`) with descriptions and example code.
3. **CLI Agent Demo (AI-Spuro - TypeScript / Node.js):**
   - Runs in a Node.js environment using **TypeScript** and **PAPI** (Polkadot-API) to connect to Polkadot (via a light-client or WS provider) and query `system.account` for a given stash address. ([Polkadot Developer Docs](https://docs.polkadot.com/develop/toolkit/api-libraries/papi/?utm_source=chatgpt.com))
   - On each run or at set intervals, the agent:
     a) fetches the current account data via PAPI  
     b) calls Spuro&apos;s x402-protected API (via Spuro Functions) to write the snapshot into Arkiv (with TTL)  
     c) reads the previous snapshot from Arkiv to detect any changes
   - Simple CLI demo that uses Spuro&apos;s API and Polkadot&apos;s PAPI

### Why this matters

- **Agent-native infrastructure**: Demonstrates how agents don’t just call APIs — they pay for the storage they use via HTTPayer/x402 while still calling chain RPC (PAPI) directly from their Node.js/TypeScript runtime.
- **Clear separation of concerns**: Spuro handles Arkiv-backed storage and payments; AI-Spuro handles Polkadot data fetching; the Spuro Docs frontend explains and catalogs the capabilities for humans and agents.
- **Practical Polkadot use case**: Stash account monitoring is directly relevant to nominators or validators who care about their balances, rewards, or staking behavior.
- **Efficient storage**: By using TTL on Arkiv snapshots, the agent avoids unbounded state growth and optimizes for cost.
- **Seamless payments**: HTTPayer abstracts away wallet complexity, making x402 payments feel like “just HTTP.”

### How to run it

This section focuses on the minimum flow a judge needs to see Spuro + Arkiv working. For full details, see the individual READMEs linked above.

1. **Clone the repo**
   - `git clone https://github.com/httpayer/sub0-hackathon.git`
   - `cd sub0-hackathon`
2. **Run the backend (Spuro FastAPI + Arkiv)**
   - See `backend/README.md` for full setup. In short:
     - Install Python deps: `cd backend && uv sync`
     - Copy env template: `cp .env.example .env`
     - Set Arkiv config in `.env` (`ARKIV_PRIVATE_KEY`, `ARKIV_RPC_URL`, `ARKIV_ACCOUNT_ADDRESS`, `PAYTO_ADDRESS`, etc.).
     - Start the API: `uv run uvicorn main:app --reload` (serves at `http://localhost:8000`, docs at `/docs`).
   - A deployed instance is also available in `backend/README.md` if you prefer not to run it locally.
3. **Run the AI-Spuro CLI agent (`cli/`)**
   - `cd cli`
   - Install deps: `npm install`
   - Configure a `.env` file with at least:
     - `API_BASE_URL` pointing at your backend (local or deployed)
     - `CLIENT_PRIVATE_KEY` (or `PRIVATE_KEY`) and `RPC_URL` for x402 payments
     - Optional: `OPENAI_API_KEY` to enable the `explain` command
   - Build and start the CLI:
     - `npm run build`
     - `npm start` (runs the `spuro` interactive shell)
   - Inside the shell you can use commands like `create`, `query`, and `monitor-stash` to exercise Arkiv-backed endpoints.
4. **Run the Spuro Functions SDK example (`packages/ts`)**
   - `cd packages/ts`
   - Install deps: `npm install`
   - Configure `.env` (see `.env.example`) with:
     - `API_BASE_URL` pointing at your backend (local or deployed)
     - `PRIVATE_KEY` and `RPC_URL` for x402 payments via `x402-fetch`
   - Run the example CLI that exercises Arkiv-backed endpoints:
     - `npm run example` – performs create/read/query operations against the Spuro backend using `spuro-functions`.
5. **Run the docs frontend (Spuro Docs)**
   - `cd frontend`
   - Install deps and run dev server:
     - `npm install`
     - `npm run dev` (serves at `http://localhost:3000`)
   - The home page links to the live FastAPI docs and documents all Spuro Functions that sit on top of Arkiv.

### How Arkiv is used

Arkiv is the core storage and query engine for Spuro; everything else wraps or documents it.

- **Backend (Spuro)**
  - Uses the Arkiv SDK to implement entity **CRUD** operations exposed as HTTP endpoints:
    - `POST /entities`, `GET /entities/{key}`, `PUT /entities/{key}`, `DELETE /entities/{key}`, `GET /entities/query`, `POST /entities/transfer`.
  - Stores stash-account snapshots and other JSON payloads as Arkiv entities with:
    - **TTL-aware storage** so stale snapshots expire automatically.
    - **Attribute-based queries** via `GET /entities/query` (e.g. filter by stash address, type, or other attributes).
    - **Ownership transfer** via `POST /entities/transfer`, mapping 1:1 to Arkiv’s ownership primitives.
  - All paid endpoints are wrapped in x402 middleware so every Arkiv call behind them is monetized.
- **TypeScript SDK (`spuro-functions` in `packages/ts`)**
  - Provides thin, strongly-typed wrappers (`createEntity`, `readEntity`, `updateEntity`, `deleteEntity`, `queryEntities`, `transferEntity`) around the Arkiv-backed HTTP API.
  - Example code (`examples/basic-usage.ts`) shows how to combine `spuro-functions` with `x402-fetch` and `viem` to:
    - Automatically pay x402 invoices.
    - Run interesting Arkiv queries (filters, limits, payload toggles).
  - Intended to be the primary way agents talk to Arkiv from TypeScript, and can be adopted by AI-Spuro or other agents.
- **AI-Spuro CLI agent (`cli/`)**
  - Provides an interactive shell (`spuro>`) for creating, querying, updating, deleting, and transferring Arkiv entities via the Spuro HTTP API.
  - Adds a `monitor-stash` command that connects to Polkadot via PAPI, fetches stash-account info, and periodically stores updates as Arkiv entities tagged with stash metadata.
  - Includes an optional `explain` command that uses OpenAI to summarize Arkiv entities for humans, showcasing a full agent + Arkiv + LLM loop.
- **Docs frontend**
  - Surfaces Arkiv-backed capabilities as a “Spuro Functions” catalogue, giving developers copy-pastable examples and pricing/usage context for these Arkiv-powered APIs.

Across these pieces we exercise multiple Arkiv features: **entity CRUD**, **TTL and expiry**, **attribute-based queries with filters and limits**, and **ownership transfer** – all wired through x402-paid HTTP endpoints.

### Judging demo checklist

For the main Arkiv track demo, you can follow this path:

1. **Open the Spuro docs UI**
   - Run `npm run dev` in `frontend` and visit `http://localhost:3000`, or use a deployed version if provided.
   - Browse the section that documents Spuro’s Arkiv-backed endpoints and Spuro Functions.
2. **Inspect the live API / Arkiv contract surface**
   - Visit the FastAPI docs (`/docs`) for the backend (either local `http://localhost:8000/docs` or the deployed URL in `backend/README.md`).
   - Confirm the Arkiv-related endpoints (`/entities`, `/entities/query`, `/entities/transfer`) and see example requests/responses.
3. **Run the TypeScript SDK example / AI-Spuro flow (Arkiv-backed)**
   - In `packages/ts`, run `npm run example` with your `.env` configured.
   - Watch it create an entity, query it, and (optionally) transfer ownership using Arkiv via x402-paid HTTP calls using the same patterns as the AI-Spuro agent.
4. **(Optional) Extend to a full AI-Spuro agent**
   - Use `spuro-functions` from `packages/ts` in your own CLI or agent process to connect to Polkadot via PAPI, snapshot a stash account, and persist it into Arkiv.
   - Observe that subsequent runs read previous snapshots from Arkiv to detect changes.

### Arkiv track judging notes

- **Tech (40%)**: Arkiv is central to the architecture, not an add-on – the backend is an Arkiv wrapper, the TypeScript SDK/CLI is a dedicated Arkiv client, and the agent/demo flows all rely on Arkiv’s TTL, query language, and ownership model.
- **Product (30%)**: The Spuro Docs frontend and `spuro-functions` SDK package the Arkiv integration into a clean API + docs surface that agents and developers can adopt with minimal friction.
- **Marketing / BD / GTM (30%)**: The project frames Arkiv as “memory-as-an-API” for agents, demonstrates pay-per-use x402 pricing via HTTPayer, and ships a concrete Polkadot stash-monitoring use case that can be pitched directly to infra providers, wallets, and agent platforms.
