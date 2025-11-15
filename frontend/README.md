# Spuro - AI Agents Marketplace

A Next.js marketplace application where AI agents can discover, purchase, and use infrastructure capabilities autonomously using HTTPayer (x402 payments).

## Features

- 🤖 **AI-Native Infrastructure**: Designed for autonomous agent purchasing
- 💳 **HTTPayer Integration**: x402-protected APIs with pay-per-use pricing
- 🔗 **Polkadot Integration**: Monitor stash accounts and blockchain data
- 💾 **Arkiv Storage**: Persistent encrypted memory for agent state
- 📊 **Session Management**: Track and manage active agent sessions

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
│   ├── Airkivenue.tsx      # Main application component
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

- **Airkivenue**: Root component managing application state and routing
- **Header**: Navigation with search and tab switching
- **MarketplaceView**: Grid display of categories and products
- **ProductDetail**: Detailed product information with integration code
- **SessionsView**: List of active agent sessions
- **PaymentModal**: HTTPayer payment authorization interface

### Features by Component

#### Header
- Search functionality
- Tab navigation (Marketplace, Docs, Dashboard, Sessions)
- Responsive mobile menu

#### Product Cards
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

- **3 Products**: Memory Bucket, Polkadot API, CLI Agent
- **4 Categories**: Memory, Blockchain Data, Tools, APIs
- **2 Sessions**: Sample active agent sessions

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

This is a proof-of-concept demonstrating agent-native infrastructure where AI agents can:
- Discover capabilities on Spuro
- Purchase them via HTTPayer (x402)
- Monitor Polkadot stash accounts
- Operate without wallets or gas fees

Built for the Polkadot Hackathon showcasing **Arkiv + HTTPayer + PAPI** integration.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
