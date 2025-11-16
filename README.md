# Spuro – powered by HTTPayer

- **backend**: [`Spuro` (Arkiv + x402 backend)](backend/README.md)
- **frontend**: [Spuro Docs & catalogue (Next.js)](docs/README.md)
- **cli**: [`AI-Spuro` agent](cli/README.md)

**Overview**

An agent-powered proof-of-concept that demonstrates how AI agents can persist and query Polkadot stash-account data using **Arkiv + HTTPayer + PAPI**. In this architecture, **Spuro** exposes Arkiv-backed memory as an x402-protected HTTP API, the **Spuro Docs** frontend is a documentation/catalogue site for Spuro and its SDK functions (spuro functions), and the **AI-Spuro** agent talks to Polkadot via PAPI while using Arkiv as its paid memory layer.

**Architecture & Components**

1. **Backend (Spuro - Python/FastAPI):**
   - Wraps Arkiv's SDK behind an x402-protected HTTP API.
   - Supports storing and retrieving JSON-encoded "snapshot" objects (e.g. Polkadot account info) with a TTL, so old data expires.
   - HTTPayer is used to handle x402 payments: when the AI-Spuro CLI agent calls this API, HTTPayer intercepts the 402, pays, and retries.
   - **Scope:** Spuro is responsible **only** for Arkiv-backed memory and generic entity CRUD/query, not for fetching Polkadot data itself.
2. **Docs Frontend (Spuro Docs - Next.js):**
   - A Next.js 16 site that documents Spuro&apos;s endpoints and the client-side SDK layer (Spuro Functions) used by agents.
   - Shows an overview of the core API (`/entities`, `/entities/{key}`, `/entities/query`, `/entities/transfer`) and how they are combined into Spuro Functions.
   - Includes a catalogue-style view of these Spuro Functions (e.g. `createEntity`, `readEntity`, `queryEntities`, `snapshotStashToArkiv`) with descriptions and example code.
3. **CLI Agent (AI-Spuro - TypeScript / Node.js):**
   - Runs in a Node.js environment using **TypeScript** and **PAPI** (Polkadot-API) to connect to Polkadot (via a light-client or WS provider) and query `system.account` for a given stash address. ([Polkadot Developer Docs](https://docs.polkadot.com/develop/toolkit/api-libraries/papi/?utm_source=chatgpt.com))
   - On each run or at set intervals, the agent:
     a) fetches the current account data via PAPI  
     b) calls Spuro&apos;s x402-protected API (via Spuro Functions) to write the snapshot into Arkiv (with TTL)  
     c) reads the previous snapshot from Arkiv to detect any changes
   - **Scope:** AI-Spuro is a simple CLI demo that **uses** Spuro&apos;s API and Polkadot&apos;s PAPI; it is designed to illustrate how agents can consume Spuro via a lightweight SDK.

**Why This Matters**

- **Agent-native infrastructure**: Demonstrates how agents don’t just call APIs — they pay for the storage they use via HTTPayer/x402 while still calling chain RPC (PAPI) directly from their Node.js/TypeScript runtime.
- **Clear separation of concerns**: Spuro handles Arkiv-backed storage and payments; AI-Spuro handles Polkadot data fetching; the Spuro Docs frontend explains and catalogs the capabilities for humans and agents.
- **Practical Polkadot use case**: Stash account monitoring is directly relevant to nominators or validators who care about their balances, rewards, or staking behavior.
- **Efficient storage**: By using TTL on Arkiv snapshots, the agent avoids unbounded state growth and optimizes for cost.
- **Seamless payments**: HTTPayer abstracts away wallet complexity, making x402 payments feel like “just HTTP.”

**Hackathon Deliverables**

- Public GitHub repo with: Spuro (Python backend) + AI-Spuro (TS CLI) + Spuro Docs frontend + README.
- A working Spuro backend API endpoint (deployed) and a docs site that describes how to use it.
- (Optional) A separate section or demo flow showing how AI-Spuro uses PAPI to fetch Polkadot data and Spuro to persist snapshots.
- A 2-minute demo video showing: running the agent, reading + writing snapshots via Spuro, and TTL expiry in action.

**Milestone-2 / Post-Hack Plan**

- Turn **AI-Spuro** from a CLI demo into an **AI SDK** so other teams can build their own custom agents (in Node.js/TypeScript) that plug into Spuro.
- Extend the docs/catalogue into a richer view of plug-and-play Arkiv-backed "Spuro Functions" that agents can call via HTTP/x402.
- Build a UI for users (nominators) to onboard their stash addresses and visualize historical balance trends.
- Add alerting when balances change or drift beyond thresholds (via webhooks / Discord / email).
- Expand to track other on-chain data (validators, nominator reward destinations, staking rewards).
- Introduce session-budgeting in HTTPayer so agents can be scoped to a weekly or monthly pay-as-you-go spend.
