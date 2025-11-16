import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.SPURO_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org";

const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org";

let PRIVATE_KEY =
  process.env.SPURO_DEMO_PRIVATE_KEY ||
  process.env.CLIENT_PRIVATE_KEY ||
  process.env.PRIVATE_KEY ||
  "";

if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = `0x${PRIVATE_KEY}`;
}

if (!PRIVATE_KEY || PRIVATE_KEY === "0x") {
  console.warn(
    "[demo/unlock] Missing SPURO_DEMO_PRIVATE_KEY / CLIENT_PRIVATE_KEY / PRIVATE_KEY env – demo will fail without credentials."
  );
}

// Lazily initialised wallet client + fetchWithPay so we reuse them across requests
let fetchWithPaySingleton: ((input: RequestInfo, init?: RequestInit) => Promise<Response>) | null =
  null;

function getFetchWithPay() {
  if (!PRIVATE_KEY || PRIVATE_KEY === "0x") {
    throw new Error(
      "Spuro demo private key is not configured. Set SPURO_DEMO_PRIVATE_KEY or CLIENT_PRIVATE_KEY."
    );
  }

  if (!fetchWithPaySingleton) {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`, { nonceManager });

    const client = createWalletClient({
      account,
      transport: http(RPC_URL),
      chain: baseSepolia,
    });

    fetchWithPaySingleton = wrapFetchWithPayment(fetch, client);
  }

  return fetchWithPaySingleton;
}

export async function POST() {
  try {
    const fetchWithPay = getFetchWithPay();

    const now = new Date().toISOString();

    // Minimal example: create a small Arkiv-backed entity via Spuro
    const payload = {
      payload: Buffer.from(
        JSON.stringify({
          message: "Hello from Spuro Docs demo",
          at: now,
        })
      ).toString("hex"),
      content_type: "application/json",
      attributes: {
        type: "docs-demo",
        created_by: "spuro-docs-demo",
        timestamp: now,
      },
      ttl: 3600,
    };

    const response = await fetchWithPay(`${API_BASE_URL}/entities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[demo/unlock] Spuro API error:", response.status, data);
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Spuro backend call failed",
          status: response.status,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        entity_key: data.entity_key,
        tx_hash: data.tx_hash,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("[demo/unlock] Unexpected error:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || "Unexpected error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}



