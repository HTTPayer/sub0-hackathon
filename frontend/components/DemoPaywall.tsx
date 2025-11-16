"use client";

import React, { useState } from "react";
import { Lock, Check, Loader2 } from "lucide-react";

type PaywallStatus = "locked" | "authorizing" | "unlocked";

const protectedSnippet = `import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";
import { createEntity, encodePayload } from "@spuro/functions";

const client = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY as \`0x\${string}\`, { nonceManager }),
  transport: http("https://sepolia.base.org"),
  chain: baseSepolia,
});

// HTTPayer/x402-wrapped fetch used for paid Spuro endpoints
const fetchWithPay = wrapFetchWithPayment(fetch, client);

await createEntity(fetchWithPay, process.env.API_BASE_URL!, {
  payload: encodePayload("Hello from an x402‑protected Spuro call"),
  content_type: "text/plain",
});`;

export default function DemoPaywall() {
  const [status, setStatus] = useState<PaywallStatus>("locked");
  const [error, setError] = useState<string | null>(null);
  const [entityKey, setEntityKey] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleAuthorize = async () => {
    setError(null);
    setStatus("authorizing");

    try {
      const res = await fetch("/api/demo/unlock", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = (await res.json()) as {
        ok?: boolean;
        entity_key?: string;
        tx_hash?: string;
      };
      if (!data.ok) {
        throw new Error("Unlock not approved");
      }

      setEntityKey(data.entity_key || null);
      setTxHash(data.tx_hash || null);
      setStatus("unlocked");
    } catch (e) {
      console.error(e);
      setError("We couldn’t complete the demo payment. Please try again.");
      setStatus("locked");
    }
  };

  const isAuthorizing = status === "authorizing";
  const isUnlocked = status === "unlocked";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-paywall-title"
        className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center"
      >
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-pink-600">
          Spuro x HTTPayer demo
        </div>

        <div className="flex items-center justify-center mb-3">
          <Lock className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
          <h1
            id="demo-paywall-title"
            className="text-2xl sm:text-3xl font-semibold text-gray-900"
          >
            Payment Required
          </h1>
        </div>

        {!isUnlocked ? (
          <>
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              Access to a live Arkiv-backed memory endpoint running behind Spuro.
              To run this demo write, authorize a small x402 payment in Base
              Sepolia USDC via HTTPayer.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Need Base Sepolia USDC? Get some{" "}
              <a
                href="https://www.coinbase.com/faucets/base-sepolia-usdc"
                target="_blank"
                rel="noreferrer"
                className="underline text-pink-600 hover:text-pink-700"
              >
                here
              </a>
              .
            </p>

            <button
              type="button"
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg bg-pink-600 text-white text-sm sm:text-base font-semibold hover:bg-pink-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isAuthorizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Waiting for on-chain payment...
                </>
              ) : (
                "Connect wallet & authorize"
              )}
            </button>

            {error && (
              <p className="mt-3 text-xs sm:text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium mb-4">
              <Check className="h-4 w-4 mr-1.5" />
              Payment complete – Spuro content unlocked
            </div>

            <p className="text-sm sm:text-base text-gray-700 mb-4">
              In a real deployment, your agent or backend would perform this
              write. Here, the docs site just triggered a paid Spuro call that
              stored a small JSON payload in Arkiv.
            </p>

            <div className="text-left bg-gray-900 text-gray-100 rounded-lg p-4 sm:p-5 overflow-x-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Protected Spuro example
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-pink-600/20 text-pink-200 text-[0.65rem] font-medium">
                  x402 protected
                </span>
              </div>
              <pre className="text-xs sm:text-[0.75rem] leading-relaxed">
                <code>{protectedSnippet}</code>
              </pre>
            </div>

            {(entityKey || txHash) && (
              <div className="mt-4 text-left text-xs sm:text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-semibold mb-1 text-gray-800">
                  Latest demo write (Arkiv entity)
                </p>
                {entityKey && (
                  <p className="break-all">
                    <span className="font-mono text-[0.7rem]">entity_key</span>:{" "}
                    {entityKey}
                  </p>
                )}
                {txHash && (
                  <p className="break-all mt-1">
                    <span className="font-mono text-[0.7rem]">tx_hash</span>:{" "}
                    {txHash}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}


