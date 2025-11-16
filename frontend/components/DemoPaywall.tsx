"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Lock, Check, Loader2 } from "lucide-react";

const ConnectWalletButton = dynamic(
  () => import("./ConnectWalletButton").then((m) => m.ConnectWalletButton),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
        disabled
      >
        Connecting wallet…
      </button>
    ),
  }
);

type PaywallStatus = "locked" | "authorizing" | "unlocked";

type StashSummary = {
  entity_key: string;
  timestamp: string | null;
  snapshot?: any;
  balance: {
    total?: string;
    spendable?: string;
    locked?: string;
    untouchable?: string;
  } | null;
  activeEra: {
    index?: number;
    start?: string | number | null;
  } | null;
};

const defaultApiBaseUrl =
  process.env.NEXT_PUBLIC_SPURO_API_BASE_URL ||
  "https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org";
const defaultRpcUrl = "https://sepolia.base.org";

export default function DemoPaywall() {
  const [status, setStatus] = useState<PaywallStatus>("locked");
  const [error, setError] = useState<string | null>(null);
  const [entityKey, setEntityKey] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(defaultApiBaseUrl);
  const [privateKey, setPrivateKey] = useState<string>("");
  const [rpcUrl, setRpcUrl] = useState<string>(defaultRpcUrl);
  const [stashAddress, setStashAddress] = useState<string>("");
  const [stashSummary, setStashSummary] = useState<StashSummary | null>(null);
  const [stashError, setStashError] = useState<string | null>(null);
  const [isLoadingStash, setIsLoadingStash] = useState(false);
  const [showRawSnapshot, setShowRawSnapshot] = useState(false);

  const handleAuthorize = async () => {
    setError(null);

    if (!apiBaseUrl) {
      setError("Set the Spuro API base URL before running the demo.");
      return;
    }

    if (!privateKey) {
      setError(
        "Paste a demo Base Sepolia private key to authorize this paid Spuro call."
      );
      return;
    }

    setStatus("authorizing");

    try {
      const response = await fetch("/api/demo/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiBaseUrl,
          privateKey,
          rpcUrl,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok || !data.entity_key) {
        throw new Error(
          data.error || "Spuro backend call failed. Check your demo key."
        );
      }

      setEntityKey(data.entity_key ?? null);
      setTxHash(data.tx_hash ?? null);
      setStatus("unlocked");
    } catch (e: any) {
      console.error("[DemoPaywall] unlock error:", e);
      setError(
        e?.message ||
          "We couldn’t complete the demo payment. Make sure your demo key is funded and try again."
      );
      setStatus("locked");
    }
  };

  const handleLoadStash = async () => {
    setStashError(null);
    setStashSummary(null);

    if (!stashAddress) {
      setStashError("Enter a Polkadot stash address first.");
      return;
    }

    if (!apiBaseUrl) {
      setStashError("Set the Spuro API base URL before running the demo.");
      return;
    }

    if (!privateKey) {
      setStashError(
        "Paste the same demo Base Sepolia private key used for the paid write."
      );
      return;
    }

    setIsLoadingStash(true);

    try {
      const res = await fetch("/api/demo/stash-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stash: stashAddress,
          apiBaseUrl,
          privateKey,
          rpcUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.reason === "no-snapshot") {
          setStashError(
            "No snapshots found yet. Run `monitor-stash <stash>` in the AI-Spuro CLI, then try again."
          );
        } else if (data.reason === "missing-private-key") {
          setStashError(
            "Paste the same demo Base Sepolia private key used for the paid write."
          );
        } else {
          setStashError(
            data.error ||
              "We couldn’t load the stash snapshot from Arkiv. Please try again."
          );
        }
        return;
      }

      const summary = data.summary as StashSummary;

      if (!summary) {
        setStashError(
          "No snapshots found yet. Run `monitor-stash <stash>` in the AI-Spuro CLI, then try again."
        );
        return;
      }

      setStashSummary(summary);
    } catch (e) {
      console.error(e);
      setStashError(
        "Unexpected error while loading stash snapshot. Please try again."
      );
    } finally {
      setIsLoadingStash(false);
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
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center"
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
            Wallet-paid Spuro write
          </h1>
        </div>

        <p className="text-sm sm:text-base text-gray-600 mb-3">
          For this hosted demo, the actual x402 payment is made from a{" "}
          <span className="font-semibold">demo Base Sepolia key</span> you paste
          below. In production, a backend or agent would hold keys – never paste
          real keys into a browser.
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          Need Base Sepolia USDC for your demo key? Get some{" "}
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

        <div className="mb-4 flex flex-col gap-4 text-left border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-[0.7rem] font-semibold text-gray-700 mb-1">
            Demo configuration (not for production)
          </p>
          <div className="space-y-1">
            <label
              htmlFor="api-base-url"
              className="block text-xs font-medium text-gray-700"
            >
              Spuro API base URL
            </label>
            <input
              id="api-base-url"
              type="url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="https://your-spuro-backend"
            />
            <p className="text-[0.7rem] text-gray-500">
              This should point at the Spuro backend that wraps Arkiv.
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="demo-private-key"
              className="block text-xs font-medium text-gray-700"
            >
              Demo EVM private key (Base Sepolia)
            </label>
            <input
              id="demo-private-key"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value.trim())}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="0x..."
            />
            <p className="text-[0.7rem] text-gray-500">
              Demo only – this key is sent to the server for this Spuro call.
              Do not use a real production key.
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="demo-rpc-url"
              className="block text-xs font-medium text-gray-700"
            >
              RPC URL (Base Sepolia)
            </label>
            <input
              id="demo-rpc-url"
              type="url"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="https://sepolia.base.org"
            />
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs font-medium text-gray-700">
              Optional – connect wallet (UX only)
            </span>
            <ConnectWalletButton />
          </div>
        </div>

        {!isUnlocked ? (
          <>
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
                "Step 2 – authorize paid Spuro write"
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
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium mb-2">
              <Check className="h-4 w-4 mr-1.5" />
              Payment complete – Spuro content unlocked
            </div>

            <p className="text-sm sm:text-base text-gray-700 mb-4">
              The backend just performed an x402-paid call to Spuro, which wrote
              an entity into Arkiv and returned its <code>entity_key</code> and{" "}
              <code>tx_hash</code>. You can inspect that entity directly in the
              live Spuro API.
            </p>

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
                {entityKey && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`${apiBaseUrl.replace(/\/$/, "")}/entities/${entityKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white text-[0.7rem] font-semibold hover:bg-gray-800"
                    >
                      Open entity in Spuro
                    </a>
                    <a
                      href={`${apiBaseUrl.replace(
                        /\/$/,
                        ""
                      )}/docs#/default/read_entity_entities__key__get`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-[0.7rem] font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Open FastAPI docs
                    </a>
                  </div>
                )}
                <p className="mt-2 text-[0.7rem] text-gray-500">
                  Tip: In the FastAPI docs, locate <code>GET /entities/{'{'}key{'}'}</code> and
                  paste the entity key above to fetch the raw Arkiv record.
                </p>
              </div>
            )}

            <div className="mt-6 text-left border-t border-gray-200 pt-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Query stash snapshots from Arkiv (AI-Spuro `monitor-stash`)
              </h2>
              <p className="text-xs text-gray-600 mb-3">
                Run{" "}
                <code className="font-mono text-[0.7rem] bg-gray-100 px-1 py-0.5 rounded">
                  monitor-stash &lt;your_stash_address&gt;
                </code>{" "}
                in the AI-Spuro CLI to create Polkadot stash snapshots in Arkiv,
                then load the latest snapshot here.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end mb-3">
                <div className="flex-1">
                  <label
                    htmlFor="stash-address"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Polkadot stash address
                  </label>
                  <input
                    id="stash-address"
                    type="text"
                    value={stashAddress}
                    onChange={(e) => setStashAddress(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="1abc… or 1xyz…"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLoadStash}
                  disabled={isLoadingStash}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoadingStash ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      Loading snapshot…
                    </>
                  ) : (
                    "Load latest snapshot"
                  )}
                </button>
              </div>

              {stashError && (
                <p className="text-xs text-red-600 mb-2" role="alert">
                  {stashError}
                </p>
              )}

              {stashSummary && (
                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                  <p className="font-semibold mb-1 text-gray-900">
                    Latest snapshot
                  </p>
                  <p className="break-all mb-1">
                    <span className="font-mono text-[0.7rem]">entity_key</span>:{" "}
                    {stashSummary.entity_key}
                  </p>
                  {stashSummary.timestamp && (
                    <p className="mb-1">
                      <span className="font-mono text-[0.7rem]">
                        timestamp
                      </span>
                      :{" "}
                      {new Date(stashSummary.timestamp).toLocaleString() ||
                        stashSummary.timestamp}
                    </p>
                  )}

                  {stashSummary.balance && (
                    <div className="mt-2">
                      <p className="font-semibold text-gray-900 mb-1">
                        Balance
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {stashSummary.balance.total && (
                          <span>
                            <span className="font-mono text-[0.7rem]">
                              total
                            </span>
                            : {stashSummary.balance.total}
                          </span>
                        )}
                        {stashSummary.balance.spendable && (
                          <span>
                            <span className="font-mono text-[0.7rem]">
                              spendable
                            </span>
                            : {stashSummary.balance.spendable}
                          </span>
                        )}
                        {stashSummary.balance.locked && (
                          <span>
                            <span className="font-mono text-[0.7rem]">
                              locked
                            </span>
                            : {stashSummary.balance.locked}
                          </span>
                        )}
                        {stashSummary.balance.untouchable && (
                          <span>
                            <span className="font-mono text-[0.7rem]">
                              untouchable
                            </span>
                            : {stashSummary.balance.untouchable}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {stashSummary.activeEra && (
                    <div className="mt-2">
                      <p className="font-semibold text-gray-900 mb-1">
                        Active era
                      </p>
                      <p>
                        <span className="font-mono text-[0.7rem]">index</span>:{" "}
                        {stashSummary.activeEra.index}
                      </p>
                      {stashSummary.activeEra.start && (
                        <p>
                          <span className="font-mono text-[0.7rem]">
                            start
                          </span>
                          : {String(stashSummary.activeEra.start)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`${apiBaseUrl.replace(
                        /\/$/,
                        ""
                      )}/entities/${stashSummary.entity_key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white text-[0.7rem] font-semibold hover:bg-gray-800"
                    >
                      View snapshot entity in Spuro
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setShowRawSnapshot((prev) => !prev)
                      }
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-[0.7rem] font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {showRawSnapshot ? "Hide raw payload" : "Show raw payload"}
                    </button>
                  </div>
                  {showRawSnapshot && (
                    <div className="mt-3 rounded-md bg-gray-900 text-gray-100 p-3 overflow-x-auto">
                      <p className="text-[0.7rem] font-semibold mb-1 text-gray-300">
                        Raw Arkiv payload (truncated)
                      </p>
                      <pre className="text-[0.7rem] leading-relaxed">
                        <code>
                          {JSON.stringify(
                            stashSummary.snapshot ?? null,
                            null,
                            2
                          )}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}


