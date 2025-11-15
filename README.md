# **Arkivendor**, **Arkivenue** & **ai-rkiv** _(Powered by HTTPayer)_

- **backend**: [`Arkivendor`](backend/README.md)
- **frontend**: [`Arkivenue`](frontend/README.md)
- **cli**: [`ai-rkiv`](cli/README.md)

**Overview**

A minimal, agent-powered proof-of-concept that demonstrates how AI agents can purchase, persist, and query Polkadot stash-account data using Arkiv + HTTPayer + PAPI + a marketplace (Arkivenue). This project shows how agents can seamlessly pay for infrastructure via x402 to access and store blockchain data, without needing to manage wallets or gas.

**Architecture & Components**

1. **Backend (Arkivendor - Python):**
   - Wrap Arkiv's SDK behind an x402-protected HTTP API.
   - This API supports storing and retrieving JSON-encoded "snapshot" objects (Polkadot account info) with a TTL, so old data expires.
   - HTTPayer is used to handle x402 payments: when the ai-rkiv CLI agent calls this API, HTTPayer intercepts the 402, pays in USDC, and retries.
2. **Marketplace (Arkivenue) Listings:**
   - **Memory Bucket**: A listing for the Arkiv-backed storage, specifying pricing per write and read, and TTL behavior.
   - **Polkadot Data API**: A listing for the Arkivendor backend API that returns Polkadot account data (`system.account`) for a given stash address via PAPI. The listing clearly shows pay-per-call pricing.
3. **CLI Agent (ai-rkiv - TypeScript):**
   - Uses **PAPI** (Polkadot-API) to connect to Polkadot (via a light-client or WS provider) and query `system.account` for a given stash address. ([Polkadot Developer Docs](https://docs.polkadot.com/develop/toolkit/api-libraries/papi/?utm_source=chatgpt.com))
   - On each run or at set intervals, the agent:
     a) fetches the current account data
     b) writes it into the Arkiv memory bucket (with TTL) via the x402 API + HTTPayer
     c) reads the previous snapshot from Arkiv to detect any changes

**Why This Matters**

- **Agent-native infrastructure**: This is a clean demo of how agents don’t just call APIs — they _buy_ the infrastructure they need (memory + chain-data) from a marketplace, paying via HTTPayer.
- **Practical Polkadot use case**: Stash account monitoring is directly relevant to nominators or validators who care about their balances, rewards, or staking behavior.
- **Efficient storage**: By using TTL on Arkiv snapshots, the agent avoids unbounded state growth and optimizes for cost.
- **Seamless payments**: HTTPayer abstracts away wallet complexity, making x402 payments feel like “just HTTP.”

**Hackathon Deliverables**

- Public GitHub repo with: Arkivendor (Python backend) + ai-rkiv (TS CLI) + marketplace listing definitions + README.
- A working Arkivenue marketplace page (can be mocked / locally deployed) for your two capabilities (memory + data API).
- A 2-minute demo video showing: purchasing via the marketplace, running the agent, reading + writing snapshots, and TTL expiry in action.

**Milestone-2 / Post-Hack Plan**

- Build a UI for users (nominators) to onboard their stash addresses and visualize historical balance trends.
- Add alerting when balances change or drift beyond thresholds (via webhooks / Discord / email).
- Expand to track other on-chain data (validators, nominator reward destinations, staking rewards).
- Introduce session-budgeting in HTTPayer so agents can be scoped to a weekly or monthly pay-as-you-go spend
