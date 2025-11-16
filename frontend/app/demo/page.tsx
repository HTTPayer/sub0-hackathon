import React from "react";
import DemoPaywall from "@/components/DemoPaywall";

export const metadata = {
  title: "Demo – AI-Spuro stash monitor",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          AI-Spuro CLI + wallet-paid Spuro demo
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          This page ties together the <code className="font-mono">AI-Spuro</code> CLI and the
          Spuro backend: first you connect your wallet and pay x402 for a Spuro write, then you
          can load Polkadot stash snapshots that the CLI created via the{" "}
          <code className="font-mono">monitor-stash</code> command.
        </p>
      </div>
      <DemoPaywall />
    </div>
  );
}


