"use client";

import React, { useState } from "react";
import MarketplaceView from "./MarketplaceView";
import ProductDetail from "./ProductDetail";
import PaymentModal from "./PaymentModal";
import { products } from "@/data/mockData";
import { Product } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Spuro() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [showDirectApi, setShowDirectApi] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Catalogue / docs view */}
      {!selectedProduct && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
              Spuro &mdash; Arkiv + x402 backend
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 px-2">
              Agent-friendly paid storage, documented as a small SDK catalogue and consumed by the AI-Spuro CLI.
            </p>
            <div className="flex justify-center px-4">
              <div className="grid gap-2 text-sm text-gray-600 max-w-2xl text-left">
                <p>
                  Spuro exposes a simple HTTP API on top of Arkiv, protected with x402 payments and automated via HTTPayer.
                </p>
                <p>
                  The AI-Spuro CLI provides a lightweight SDK where each function wraps one or more Spuro endpoints for agents.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture overview */}
          <section className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-10">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Spuro backend
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
                Spuro Functions SDK (client)
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                A lightweight TypeScript layer (used by the CLI) where each function
                such as <code className="font-mono text-[0.7rem]">createEntity</code> or{" "}
                <code className="font-mono text-[0.7rem]">queryEntities</code> is a
                Spuro Function.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                AI-Spuro CLI agent
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Example CLI agent that talks to Polkadot via PAPI, then uses the
                Spuro Functions SDK to store and query snapshots through Spuro.
              </p>
            </div>
          </section>

          {/* Functions catalogue */}
          <MarketplaceView products={products} onProductSelect={setSelectedProduct} />

          {/* API & CLI docs summary */}
          <section className="mt-10 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <button
                onClick={() => setShowApiDocs(!showApiDocs)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  API Endpoints Overview
                </h3>
                {showApiDocs ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              {!showApiDocs && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Click to view detailed API endpoint documentation with request/response examples.
                  <a
                    href="https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 hover:text-pink-700 underline ml-1"
                  >
                    View live API docs →
                  </a>
                </p>
              )}
              {showApiDocs && (
                <div className="mt-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                All endpoints except <code className="font-mono text-[0.7rem]">GET /</code> require x402 payment via HTTPayer. 
                Full OpenAPI documentation:{" "}
                <a
                  href="https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-600 hover:text-pink-700 underline"
                >
                  Spuro live API docs
                </a>
              </p>

              <div className="space-y-4">
                {/* GET / */}
                <div className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-[0.7rem] bg-gray-100 px-2 py-1 rounded">GET /</code>
                    <span className="text-xs text-gray-500">Health check (free)</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Returns API status and health information.</p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Response:</div>
                    <div className="text-gray-600">{`{"message": "Arkiv API with X402 Payments", "status": "healthy"}`}</div>
                  </div>
                </div>

                {/* POST /entities */}
                <div className="border-l-2 border-pink-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-[0.7rem] bg-pink-50 px-2 py-1 rounded">POST /entities</code>
                    <span className="text-xs text-pink-600">x402 required</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Create a new Arkiv entity with payload, attributes, and TTL.</p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto mb-2">
                    <div className="text-gray-700">Request body:</div>
                    <div className="text-gray-600">{`{
  "payload": "hex-encoded bytes",
  "content_type": "text/plain",
  "attributes": {"type": "snapshot"},
  "ttl": 86400
}`}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Response (201):</div>
                    <div className="text-gray-600">{`{
  "entity_key": "...",
  "tx_hash": "..."
}`}</div>
                  </div>
                </div>

                {/* GET /entities/{key} */}
                <div className="border-l-2 border-pink-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-[0.7rem] bg-pink-50 px-2 py-1 rounded">GET /entities/&lt;entity_key&gt;</code>
                    <span className="text-xs text-pink-600">x402 required</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Read a stored entity and its metadata by key.</p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Response (200):</div>
                    <div className="text-gray-600">{`{
  "data": "decoded payload string",
  "entity": {
    "key": "...",
    "owner": "0x...",
    "content_type": "text/plain",
    "attributes": {...}
  }
}`}</div>
                  </div>
                </div>

                {/* PUT /entities/{key} */}
                <div className="border-l-2 border-pink-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-[0.7rem] bg-pink-50 px-2 py-1 rounded">PUT /entities/&lt;entity_key&gt;</code>
                    <span className="text-xs text-pink-600">x402 required</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Update an entity&apos;s payload, attributes, content type, or TTL.</p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto mb-2">
                    <div className="text-gray-700">Request body (all optional):</div>
                    <div className="text-gray-600">{`{
  "payload": "hex-encoded bytes",
  "attributes": {"updated": true},
  "content_type": "application/json",
  "ttl": 172800
}`}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Response (200):</div>
                    <div className="text-gray-600">{`{
  "status": "success",
  "entity_key": "...",
  "tx_hash": "..."
}`}</div>
                  </div>
                </div>

                {/* DELETE /entities/{key} */}
                <div className="border-l-2 border-pink-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-[0.7rem] bg-pink-50 px-2 py-1 rounded">DELETE /entities/&lt;entity_key&gt;</code>
                    <span className="text-xs text-pink-600">x402 required</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Delete an entity from Arkiv storage.</p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Response (200):</div>
                    <div className="text-gray-600">{`{
  "status": "success",
  "entity_key": "...",
  "tx_hash": "..."
}`}</div>
                  </div>
                </div>

                {/* GET /entities/query */}
                <div className="border-l-2 border-pink-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-[0.7rem] bg-pink-50 px-2 py-1 rounded">GET /entities/query</code>
                    <span className="text-xs text-pink-600">x402 required</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Query entities by attributes using a query string.</p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto mb-2">
                    <div className="text-gray-700">Query parameters:</div>
                    <div className="text-gray-600">query (required), limit (default: 20), include_payload (default: false)</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto mb-2">
                    <div className="text-gray-700">Query examples:</div>
                    <div className="text-gray-600 space-y-1">
                      <div>{`type = "snapshot"`}</div>
                      <div>{`age > 25`}</div>
                      <div>{`type = "user" AND age >= 30`}</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Response (200):</div>
                    <div className="text-gray-600">{`{
  "query": "type = \\"snapshot\\"",
  "count": 5,
  "results": [
    {
      "key": "...",
      "attributes": {...},
      "payload": "..." // if include_payload=true
    }
  ]
}`}</div>
                  </div>
                </div>

                {/* POST /entities/transfer */}
                <div className="border-l-2 border-pink-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-[0.7rem] bg-pink-50 px-2 py-1 rounded">POST /entities/transfer</code>
                    <span className="text-xs text-pink-600">x402 required</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Transfer ownership of an entity from backend wallet to a new owner.</p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto mb-2">
                    <div className="text-gray-700">Request body:</div>
                    <div className="text-gray-600">{`{
  "entity_key": "...",
  "new_owner": "0x..."
}`}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Response (200):</div>
                    <div className="text-gray-600">{`{
  "status": "success",
  "entity_key": "...",
  "old_owner": "0x...",
  "new_owner": "0x...",
  "tx_hash": "..."
}`}</div>
                  </div>
                </div>
              </div>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <button
                onClick={() => setShowGettingStarted(!showGettingStarted)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  Getting Started
                </h3>
                {showGettingStarted ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              {!showGettingStarted && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Click to view step-by-step setup instructions for backend and SDK installation.
                </p>
              )}
              {showGettingStarted && (
                <div className="mt-4">
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">1. Backend Setup</h4>
                  <ol className="text-xs sm:text-sm text-gray-600 space-y-1 list-decimal list-inside ml-2">
                    <li>Install Python 3.13+ and <code className="font-mono text-[0.7rem]">uv</code> package manager</li>
                    <li>Navigate to <code className="font-mono text-[0.7rem]">backend/</code> directory</li>
                    <li>Create <code className="font-mono text-[0.7rem]">.env</code> file with:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                        <li><code className="font-mono text-[0.7rem]">ARKIV_PRIVATE_KEY</code> - Your Arkiv private key</li>
                        <li><code className="font-mono text-[0.7rem]">PAYTO_ADDRESS</code> - Payment recipient address</li>
                        <li><code className="font-mono text-[0.7rem]">API_COST</code> - Price per request (default: 0.01)</li>
                      </ul>
                    </li>
                    <li>Run <code className="font-mono text-[0.7rem]">uv sync</code> to install dependencies</li>
                    <li>Start server: <code className="font-mono text-[0.7rem]">uv run uvicorn main:app --reload</code></li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-2">
                    See <a href="https://github.com/HTTPayer/sub0-hackathon/blob/main/backend/README.md" target="_blank" rel="noreferrer" className="text-pink-600 hover:text-pink-700 underline">backend README</a> for full setup instructions.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">2. SDK Installation</h4>
                  <ol className="text-xs sm:text-sm text-gray-600 space-y-1 list-decimal list-inside ml-2">
                    <li>Install from local path: <code className="font-mono text-[0.7rem]">npm install ../../packages/ts</code></li>
                    <li>Or add to <code className="font-mono text-[0.7rem]">package.json</code>:
                      <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono mt-1">
                        {`"dependencies": {
  "spuro-functions": "file:../packages/ts"
}`}
                      </div>
                    </li>
                    <li>Install x402-fetch and viem: <code className="font-mono text-[0.7rem]">npm install x402-fetch viem</code></li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-2">
                    See <a href="https://github.com/HTTPayer/sub0-hackathon/blob/main/packages/ts/README.md" target="_blank" rel="noreferrer" className="text-pink-600 hover:text-pink-700 underline">SDK README</a> for full documentation.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">3. Using the SDK</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Setup x402-fetch with your wallet, then use Spuro Functions to interact with the backend:
                  </p>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Example:</div>
                    <div className="text-gray-600">{`import { wrapFetchWithPayment } from "x402-fetch";
import { createEntity, encodePayload } from "spuro-functions";

const fetchWithPay = wrapFetchWithPayment(fetch, walletClient);
const result = await createEntity(fetchWithPay, API_URL, {
  payload: encodePayload("Hello"),
  attributes: { type: "test" }
});`}</div>
                  </div>
                </div>
              </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <button
                onClick={() => setShowDirectApi(!showDirectApi)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  Using the Backend API Directly
                </h3>
                {showDirectApi ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              {!showDirectApi && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Click to view code examples for using the API directly with cURL, Python, and TypeScript (without the SDK).
                </p>
              )}
              {showDirectApi && (
                <div className="mt-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                You can call the Spuro backend API directly without the SDK. All paid endpoints require x402 payment headers.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">cURL Example</h4>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-700">Create entity (with x402 payment):</div>
                    <div className="text-gray-600 whitespace-pre-wrap">{`curl -X POST http://localhost:8000/entities \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-From: 0x..." \\
  -H "X-Payment-To: 0x..." \\
  -H "X-Payment-Amount: 10000000000000000" \\
  -d '{
    "payload": "48656c6c6f",
    "content_type": "text/plain",
    "attributes": {"type": "test"},
    "ttl": 86400
  }'`}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Python Example</h4>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-600 whitespace-pre-wrap">{`import requests

# Note: In production, use x402-fetch or HTTPayer client
# to handle payment headers automatically

response = requests.post(
    "http://localhost:8000/entities",
    json={
        "payload": "48656c6c6f",  # hex-encoded "Hello"
        "content_type": "text/plain",
        "attributes": {"type": "test"},
        "ttl": 86400
    },
    headers={
        "Content-Type": "application/json",
        # x402 payment headers would go here
    }
)
print(response.json())`}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">TypeScript Example</h4>
                  <div className="bg-gray-50 p-2 rounded text-[0.65rem] font-mono overflow-x-auto">
                    <div className="text-gray-600 whitespace-pre-wrap">{`// Using native fetch (requires manual x402 handling)
const response = await fetch("http://localhost:8000/entities", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // x402 payment headers would go here
  },
  body: JSON.stringify({
    payload: "48656c6c6f",
    content_type: "text/plain",
    attributes: { type: "test" },
    ttl: 86400
  })
});

// Recommended: Use x402-fetch wrapper
import { wrapFetchWithPayment } from "x402-fetch";
const fetchWithPay = wrapFetchWithPayment(fetch, walletClient);
// Then use fetchWithPay normally - payments handled automatically`}</div>
                  </div>
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded p-3">
                  <p className="text-xs text-pink-800">
                    <strong>Note:</strong> For production use, we recommend using the Spuro Functions SDK or x402-fetch wrapper to handle payments automatically. Manual x402 header management is complex and error-prone.
                  </p>
                </div>
              </div>
                </div>
              )}
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


