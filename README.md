# **Spuro**, **Arkivendor** & **ai-rkiv** _(Powered by HTTPayer)_

- **backend**: [`Arkivendor` (Arkiv x402 backend)](backend/README.md)
- **frontend**: [`Spuro` marketplace UI](frontend/README.md)
- **cli**: [`ai-rkiv` agent](cli/README.md)

**Overview**

An agent-powered proof-of-concept that demonstrates how AI agents can discover, purchase, persist, and query Polkadot stash-account data using **Arkiv + HTTPayer + PAPI**. In this architecture, **Arkivendor** exposes Arkiv-backed memory as an x402-protected HTTP API, and **Spuro** is the marketplace UI where agents purchase **memory** capacity (not chain data). The **ai-rkiv** agent separately talks to Polkadot via PAPI and simply uses Arkiv as its paid memory layer.

**Architecture & Components**

1. **Backend (Arkivendor - Python):**
   - Wrap Arkiv's SDK behind an x402-protected HTTP API.
   - This API supports storing and retrieving JSON-encoded "snapshot" objects (e.g. Polkadot account info) with a TTL, so old data expires.
   - HTTPayer is used to handle x402 payments: when the ai-rkiv CLI agent calls this API, HTTPayer intercepts the 402, pays in USDC, and retries.
   - **Scope:** Arkivendor is responsible **only** for Arkiv-backed memory (the "Memory Bucket" capability), not for fetching Polkadot data itself.
2. **Marketplace Frontend (Spuro - Next.js):**
   - A Next.js 16 marketplace UI where agents (and humans) can browse and purchase Arkiv-backed "functions" exposed by Arkivendor.
   - For this demo, Spuro lists a single Arkivendor-backed memory function: **Memory Bucket**, with x402-style pricing, badges, and integration snippets.
   - Includes a payment modal that models HTTPayer-powered session budgeting and API access permissions, plus a sessions dashboard to visualize active agent sessions (future work).
3. **CLI Agent (ai-rkiv - TypeScript / Node.js):**
   - Runs in a Node.js environment using **TypeScript** and **PAPI** (Polkadot-API) to connect to Polkadot (via a light-client or WS provider) and query `system.account` for a given stash address. ([Polkadot Developer Docs](https://docs.polkadot.com/develop/toolkit/api-libraries/papi/?utm_source=chatgpt.com))
   - On each run or at set intervals, the agent:
     a) fetches the current account data via PAPI  
     b) calls Arkivendor's x402-protected memory function to write the snapshot into Arkiv (with TTL)  
     c) reads the previous snapshot from Arkiv to detect any changes
   - **Scope:** ai-rkiv is a simple CLI demo that **uses** Arkivendor's memory function and Polkadot's PAPI; it is not itself an Arkivendor capability, but is designed to evolve into an SDK for building more agents over time.

**Why This Matters**

- **Agent-native infrastructure**: This is a clean demo of how agents don’t just call APIs — they _buy_ the infrastructure they need (memory functions) from a marketplace, paying via HTTPayer, while still calling chain RPC (PAPI) directly from their Node.js/TypeScript runtime.
- **Full-stack marketplace**: ai-rkiv leverages Spuro as its marketplace to discover and purchase Arkiv-backed **functions** exposed by Arkivendor, turning Arkiv into an agent-usable product surface that feels familiar to developers _and_ agent frameworks. Polkadot data fetching via PAPI is outside Arkivendor’s responsibility and is not listed as an Arkivendor capability.
- **Practical Polkadot use case**: Stash account monitoring is directly relevant to nominators or validators who care about their balances, rewards, or staking behavior.
- **Efficient storage**: By using TTL on Arkiv snapshots, the agent avoids unbounded state growth and optimizes for cost.
- **Seamless payments**: HTTPayer abstracts away wallet complexity, making x402 payments feel like “just HTTP.”

**Hackathon Deliverables**

- Public GitHub repo with: Arkivendor (Python backend) + ai-rkiv (TS CLI) + Spuro marketplace UI + marketplace listing definitions + README.
- A working Spuro marketplace page (can be mocked / locally deployed) for the Arkivendor memory capability: **Memory Bucket**.
- (Optional) A separate section or demo flow showing how ai-rkiv uses PAPI to fetch Polkadot data and Arkivendor to persist snapshots.
- A 2-minute demo video showing: purchasing memory via the marketplace, running the agent, reading + writing snapshots, and TTL expiry in action.

**Milestone-2 / Post-Hack Plan**

- Turn **ai-rkiv** from a CLI demo into an **AI SDK** so other teams can build their own custom agents (in Node.js/TypeScript) that plug into Arkivendor/Spuro.
- Extend Spuro into a richer marketplace of plug-and-play Arkiv-backed "functions" (similar to AWS Lambda or Chainlink Functions) that agents can call via HTTP/x402.
- Build a UI for users (nominators) to onboard their stash addresses and visualize historical balance trends.
- Add alerting when balances change or drift beyond thresholds (via webhooks / Discord / email).
- Expand to track other on-chain data (validators, nominator reward destinations, staking rewards).
- Introduce session-budgeting in HTTPayer so agents can be scoped to a weekly or monthly pay-as-you-go spend.
