import React from "react";
import HackathonBanner from "@/components/HackathonBanner";

export const metadata = {
  title: "Use Cases",
};

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-2">
            Spuro Playbook
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Use Cases for Agent-Native Infrastructure
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
            Explore how autonomous AI agents can buy and use infrastructure via
            HTTPayer. Start with the{" "}
            <span className="font-semibold">ai-rkiv</span> Polkadot snapshot
            monitor.
          </p>
        </header>

        <div className="mb-8 sm:mb-10">
          <HackathonBanner />
        </div>

        <section className="space-y-6 sm:space-y-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1">
                  Polkadot Stash Snapshot Monitor
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  <span className="font-semibold">Agent:</span> ai-rkiv ·{" "}
                  <span className="font-semibold">Capability:</span> Memory
                  Bucket (Arkivendor) ·{" "}
                  <span className="font-semibold">Payments:</span> HTTPayer
                  (x402)
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700 border border-pink-100">
                Production-style flow
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-700 mt-3">
              The <span className="font-semibold">ai-rkiv</span> agent runs
              outside of Spuro (e.g. in a Node.js/TypeScript environment). It
              connects to Polkadot via PAPI, takes periodic snapshots of stash
              accounts, and stores them in Arkiv through the{" "}
              <span className="font-semibold">Memory Bucket</span> capability
              purchased via HTTPayer.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  1. Discover &amp; purchase
                </p>
                <p className="text-sm text-gray-700">
                  Agent queries Spuro&apos;s marketplace, finds the{" "}
                  <span className="font-semibold">Memory Bucket</span>{" "}
                  capability, and authorizes spend via HTTPayer (x402).
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  2. Monitor Polkadot
                </p>
                <p className="text-sm text-gray-700">
                  Using PAPI, the agent reads stash-account balances and
                  metadata on a schedule, preparing encrypted snapshot payloads.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  3. Store &amp; recall snapshots
                </p>
                <p className="text-sm text-gray-700">
                  Snapshots are written to Arkiv via Arkivendor. HTTPayer
                  handles payments per write/read, while TTL ensures old data
                  expires automatically.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                How this connects to the demo
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  The <span className="font-semibold">Memory Bucket</span>{" "}
                  listing in Spuro represents the Arkiv-based storage that the
                  <span className="font-semibold"> ai-rkiv</span> agent
                  purchases.
                </li>
                <li>
                  Your marketplace UI shows how agents discover and price this
                  capability before using it programmatically.
                </li>
                <li>
                  End-to-end, this demonstrates agent-native infra: discovery,
                  payment, and usage without a human in the loop.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              More use cases you could add next
            </h3>
            <p className="text-sm sm:text-base text-gray-700 mb-3">
              Use this page as a scaffold to document future agent flows that
              reuse HTTPayer and Arkiv capabilities.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>On-chain risk scoring agent with paid access to risk models</li>
              <li>
                Portfolio rebalancing agent that pays per strategy backtest
              </li>
              <li>On-demand archival of high-value on-chain events</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}


