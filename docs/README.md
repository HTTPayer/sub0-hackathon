# Arkivendor Docs & Catalogue

A Next.js application that documents **Arkivendor – powered by httpayer**: an Arkiv + x402 backend exposed as an agent-friendly HTTP API and SDK (arkivolts) and consumed by the **AI‑rkiv** CLI agent.

## Features

- 🤖 **AI-Native Infrastructure**: Shows how agents can use Arkiv-backed storage via Arkivendor
- 💳 **HTTPayer Integration**: x402-protected APIs with pay-per-use pricing, paid by agents
- 💾 **Arkiv Storage (Arkivendor)**: Persistent encrypted memory for agent state via Arkiv entities with TTL
- 🔗 **External Polkadot Integration**: Designed to be used alongside the `ai-rkiv` agent, which runs in Node.js/TypeScript, queries stash-account data via PAPI, and then stores snapshots in Arkiv via Arkivendor
- 🧩 **Arkivolts SDK Catalogue**: Documents a small set of client-side functions (arkivolts) that wrap Arkivendor endpoints (`createEntity`, `readEntity`, `queryEntities`, `snapshotStashToArkiv`)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Package Manager**: npm

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── Spuro.tsx           # Main documentation/catalogue component (Arkivendor overview)
│   ├── Header.tsx          # Navigation header
│   ├── HackathonBanner.tsx # Demo banner
│   ├── MarketplaceView.tsx # Marketplace grid view
│   ├── CategoryCard.tsx    # Category display card
│   ├── ProductCard.tsx     # Product listing card
│   ├── ProductDetail.tsx   # Product detail view
│   ├── SessionsView.tsx    # Sessions list view
│   ├── SessionCard.tsx     # Session display card
│   └── PaymentModal.tsx    # HTTPayer payment modal
├── data/
│   └── mockData.ts         # Mock data for products and sessions
├── types/
│   └── index.ts            # TypeScript type definitions
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Live Arkivendor API Docs

The Arkivendor backend is deployed with interactive OpenAPI docs:

- Live API: [`https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/`](https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/)
- API docs: [`https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/docs`](https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/docs)

The **API & endpoints overview** section on the home page links directly to these docs so you can explore the live FastAPI schema while reading the catalogue.

### Build for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Component Overview

### Main Components

- **Spuro** (`Spuro.tsx`): Root component rendering the Arkivendor overview, functions catalogue, and quickstart sections
- **Header**: Top navigation with Arkivendor branding
- **MarketplaceView**: Grid display of arkivolts/SDK capabilities
- **ProductDetail**: Detailed capability information with integration code
- **PaymentModal**: Example HTTPayer/x402 payment authorization interface

### Features by Component

#### Header

- Single-page docs/catalogue layout

#### Product Cards (Arkivolts)

- Feature badges
- Pricing estimates
- Uptime and user statistics
- x402 protection indicator

#### Product Detail

- Code integration examples
- Copy-to-clipboard functionality
- Pricing breakdown
- HTTPayer payment button

#### Payment Modal

- Spend limit configuration
- API access permissions
- Session token generation

## Mock Data

The application uses mock data defined in `data/mockData.ts`:

- **Arkivolts Product**: `Arkivolts for snapshots` (a documentation card for the SDK functions used by AI‑rkiv)
- **Sessions**: Sample session data you can use if you wire up a sessions view in the future

## Styling

The project uses Tailwind CSS with:

- Responsive design (mobile-first)
- Custom color scheme (pink primary, black accents)
- Consistent spacing and typography
- Hover states and transitions

## TypeScript Types

Key interfaces defined in `types/index.ts`:

- `Category`: Service categories with icons
- `Product`: Product listings with pricing
- `Session`: Active agent sessions
- `TabType`: Navigation tab types

## Polkadot Hackathon Demo

This frontend participates in a broader proof-of-concept demonstrating agent-native infrastructure where AI agents can:

- Use **Arkiv-backed memory** via Arkivendor&apos;s HTTP API
- Pay for reads/writes via HTTPayer (x402)
- Rely on the `ai-rkiv` agent (Node.js/TypeScript) to monitor Polkadot stash accounts via PAPI and persist snapshots into Arkiv via Arkivendor
- Work with a small, documented set of arkivolts (SDK functions) instead of raw HTTP calls

Built for the sub0 Hackathon showcasing **Arkiv + HTTPayer + PAPI** integration, with Polkadot data fetching handled outside of Arkivendor and Arkiv capabilities documented here as a catalogue rather than a marketplace UI.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
