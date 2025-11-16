# Arkivendor – powered by httpayer

- **backend**: [`Arkivendor` (Arkiv + x402 backend)](backend/README.md)
- **frontend**: [Arkivendor docs & catalogue (Next.js)](frontend/README.md)
- **cli**: [`ai-rkiv` agent](cli/README.md)

**Overview**

An agent-powered proof-of-concept that demonstrates how AI agents can persist and query Polkadot stash-account data using **Arkiv + HTTPayer + PAPI**. In this architecture, **Arkivendor** exposes Arkiv-backed memory as an x402-protected HTTP API, the **frontend** is a documentation/catalogue site for Arkivendor and its SDK functions (arkivolts), and the **ai-rkiv** agent talks to Polkadot via PAPI while using Arkiv as its paid memory layer.

**Architecture & Components**

1. **Backend (Arkivendor - Python/FastAPI):**
   - Wraps Arkiv's SDK behind an x402-protected HTTP API.
   - Supports storing and retrieving JSON-encoded "snapshot" objects (e.g. Polkadot account info) with a TTL, so old data expires.
   - HTTPayer is used to handle x402 payments: when the ai-rkiv CLI agent calls this API, HTTPayer intercepts the 402, pays, and retries.
   - **Scope:** Arkivendor is responsible **only** for Arkiv-backed memory and generic entity CRUD/query, not for fetching Polkadot data itself.
2. **Docs Frontend (Next.js):**
   - A Next.js 16 site that documents Arkivendor&apos;s endpoints and the client-side SDK functions (arkivolts) used by agents.
   - Shows an overview of the core API (`/entities`, `/entities/{key}`, `/entities/query`, `/entities/transfer`) and how they are combined into arkivolts.
   - Includes a catalogue-style view of these arkivolts (e.g. `createEntity`, `readEntity`, `queryEntities`, `snapshotStashToArkiv`) with descriptions and example code.
3. **CLI Agent (ai-rkiv - TypeScript / Node.js):**
   - Runs in a Node.js environment using **TypeScript** and **PAPI** (Polkadot-API) to connect to Polkadot (via a light-client or WS provider) and query `system.account` for a given stash address. ([Polkadot Developer Docs](https://docs.polkadot.com/develop/toolkit/api-libraries/papi/?utm_source=chatgpt.com))
   - On each run or at set intervals, the agent:
     a) fetches the current account data via PAPI  
     b) calls Arkivendor&apos;s x402-protected API (via arkivolts) to write the snapshot into Arkiv (with TTL)  
     c) reads the previous snapshot from Arkiv to detect any changes
   - **Scope:** ai-rkiv is a simple CLI demo that **uses** Arkivendor&apos;s API and Polkadot&apos;s PAPI; it is designed to illustrate how agents can consume Arkivendor via a lightweight SDK.

**Why This Matters**

- **Agent-native infrastructure**: Demonstrates how agents don’t just call APIs — they pay for the storage they use via HTTPayer/x402 while still calling chain RPC (PAPI) directly from their Node.js/TypeScript runtime.
- **Clear separation of concerns**: Arkivendor handles Arkiv-backed storage and payments; ai-rkiv handles Polkadot data fetching; the docs frontend explains and catalogs the capabilities for humans and agents.
- **Practical Polkadot use case**: Stash account monitoring is directly relevant to nominators or validators who care about their balances, rewards, or staking behavior.
- **Efficient storage**: By using TTL on Arkiv snapshots, the agent avoids unbounded state growth and optimizes for cost.
- **Seamless payments**: HTTPayer abstracts away wallet complexity, making x402 payments feel like “just HTTP.”

**Hackathon Deliverables**

- Public GitHub repo with: Arkivendor (Python backend) + ai-rkiv (TS CLI) + Arkivendor docs frontend + README.
- A working Arkivendor backend API endpoint (deployed) and a docs site that describes how to use it.
- (Optional) A separate section or demo flow showing how ai-rkiv uses PAPI to fetch Polkadot data and Arkivendor to persist snapshots.
- A 2-minute demo video showing: running the agent, reading + writing snapshots via Arkivendor, and TTL expiry in action.

**Milestone-2 / Post-Hack Plan**

- Turn **ai-rkiv** from a CLI demo into an **AI SDK** so other teams can build their own custom agents (in Node.js/TypeScript) that plug into Arkivendor.
- Extend the docs/catalogue into a richer view of plug-and-play Arkiv-backed "functions" (arkivolts) that agents can call via HTTP/x402.
- Build a UI for users (nominators) to onboard their stash addresses and visualize historical balance trends.
- Add alerting when balances change or drift beyond thresholds (via webhooks / Discord / email).
- Expand to track other on-chain data (validators, nominator reward destinations, staking rewards).
- Introduce session-budgeting in HTTPayer so agents can be scoped to a weekly or monthly pay-as-you-go spend.
