# AI-Spuro CLI Agent (`cli/`)

Interactive TypeScript CLI that talks to the **Spuro** backend and **Arkiv** over x402-paid HTTP, and optionally to Polkadot via **PAPI**.

### What it does

- Connects to the Spuro FastAPI backend (Arkiv wrapper) and exposes commands for:
  - Creating, reading, updating, deleting, querying, and transferring Arkiv entities.
  - Monitoring a Polkadot stash account and storing snapshots in Arkiv (`monitor-stash`).
  - Using an LLM to explain Arkiv entities (`explain`) when `OPENAI_API_KEY` is configured.

### How to run

1. Install dependencies:
   - `cd cli`
   - `npm install`
2. Configure `.env`:
   - `API_BASE_URL` – Spuro backend URL (e.g. `http://localhost:8000`)
   - `CLIENT_PRIVATE_KEY` or `PRIVATE_KEY` – EVM key for x402 payments
   - `RPC_URL` – EVM RPC (e.g. `https://sepolia.base.org`)
   - Optional: `OPENAI_API_KEY` – enable `explain` command
3. Build and start:
   - `npm run build`
   - `npm start`

You should see the `spuro>` prompt. Type `help` for the full list of commands.

For architecture and Arkiv track context, see the root `README.md`.


