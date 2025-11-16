"use client";

import React, { useState } from "react";
import MarketplaceView from "./MarketplaceView";
import ProductDetail from "./ProductDetail";
import PaymentModal from "./PaymentModal";
import { products } from "@/data/mockData";
import { Product } from "@/types";

export default function Spuro() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Catalogue / docs view */}
      {!selectedProduct && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
              Arkivendor &mdash; Arkiv + x402 backend
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 px-2">
              Agent-friendly paid storage, documented as a small SDK catalogue and consumed by the AI‑rkiv CLI.
            </p>
            <div className="flex justify-center px-4">
              <div className="grid gap-2 text-sm text-gray-600 max-w-2xl text-left">
                <p>
                  Arkivendor exposes a simple HTTP API on top of Arkiv, protected with x402 payments and automated via httpayer.
                </p>
                <p>
                  The AI‑rkiv CLI provides a lightweight SDK where each function (arkivolt) wraps one or more Arkivendor endpoints for agents.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture overview */}
          <section className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-10">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Arkivendor backend
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                FastAPI service that wraps the Arkiv SDK behind x402, exposing
                endpoints like <code className="font-mono text-[0.7rem]">/entities</code>{" "}
                and <code className="font-mono text-[0.7rem]">/entities/query</code> for
                paid storage.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Arkivolts SDK (client)
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                A lightweight TypeScript layer (used by the CLI) where each function
                such as <code className="font-mono text-[0.7rem]">createEntity</code> or{" "}
                <code className="font-mono text-[0.7rem]">queryEntities</code> is an
                arkivolt.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                AI‑rkiv CLI agent
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Example CLI agent that talks to Polkadot via PAPI, then uses the
                arkivolts SDK to store and query snapshots through Arkivendor.
              </p>
            </div>
          </section>

          {/* Functions catalogue */}
          <MarketplaceView products={products} onProductSelect={setSelectedProduct} />

          {/* Arkivolts table */}
          <section className="mt-10 overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Arkivolts (SDK functions)
            </h3>
            <table className="min-w-full text-xs sm:text-sm border border-gray-200 bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Purpose
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Input
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Backend endpoint(s)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 font-mono text-[0.7rem]">
                    createEntity
                  </td>
                  <td className="px-3 py-2">
                    Store a new snapshot or payload in Arkiv with attributes and TTL.
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[0.7rem]">payload, attributes?, ttl?</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[0.7rem]">POST /entities</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[0.7rem]">readEntity</td>
                  <td className="px-3 py-2">
                    Fetch a previously stored snapshot and its metadata by key.
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[0.7rem]">entityKey</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[0.7rem]">
                      GET /entities/&lt;entity_key&gt;
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[0.7rem]">
                    queryEntities
                  </td>
                  <td className="px-3 py-2">
                    Query snapshots by attributes (e.g. stash, type, timestamp).
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[0.7rem]">query, limit?, includePayload?</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[0.7rem]">GET /entities/query</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[0.7rem]">
                    snapshotStashToArkiv
                  </td>
                  <td className="px-3 py-2">
                    High-level helper (in the CLI) that fetches Polkadot stash data via
                    PAPI and persists a snapshot using <code className="font-mono text-[0.7rem]">createEntity</code>.
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[0.7rem]">stashAddress</code>
                  </td>
                  <td className="px-3 py-2">
                    <span className="block">
                      PAPI (on-chain query) +{" "}
                      <code className="font-mono text-[0.7rem]">POST /entities</code>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* API & CLI docs summary */}
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                API &amp; endpoints overview
              </h3>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>
                  <code className="font-mono text-[0.7rem]">POST /entities</code> &mdash;
                  create a new Arkiv entity with payload, attributes, and TTL.
                </li>
                <li>
                  <code className="font-mono text-[0.7rem]">
                    GET /entities/&lt;entity_key&gt;
                  </code>{" "}
                  &mdash; read a stored snapshot and its metadata.
                </li>
                <li>
                  <code className="font-mono text-[0.7rem]">
                    GET /entities/query
                  </code>{" "}
                  &mdash; query entities by attributes (e.g. stash, type, timestamp).
                </li>
                <li>
                  <code className="font-mono text-[0.7rem]">POST /entities/transfer</code>{" "}
                  &mdash; change ownership of an entity.
                </li>
              </ul>
              <p className="mt-3 text-xs sm:text-sm text-gray-600">
                Full OpenAPI documentation is available at{" "}
                <a
                  href="https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-600 hover:text-pink-700 underline"
                >
                  Arkivendor live API docs
                </a>
                .
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Getting started with AI‑rkiv
              </h3>
              <ol className="text-xs sm:text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Run the Arkivendor backend and configure your .env.</li>
                <li>
                  Install and configure the AI‑rkiv CLI so it can call Arkivendor over
                  x402/httpayer.
                </li>
                <li>
                  Use the arkivolts SDK functions (below) from the agent to write and
                  query snapshots.
                </li>
              </ol>
            </div>
          </section>
        </div>
      )}

      {/* Product detail */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onPaymentClick={() => setShowPaymentModal(true)}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}


