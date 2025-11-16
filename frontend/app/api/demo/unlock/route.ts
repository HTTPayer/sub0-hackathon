import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

export const dynamic = "force-dynamic";

const DEFAULT_API_BASE_URL =
  process.env.SPURO_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org";

const DEFAULT_RPC_URL = "https://sepolia.base.org";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const apiBaseUrl: string =
      (body && typeof body.apiBaseUrl === "string" && body.apiBaseUrl) ||
      DEFAULT_API_BASE_URL;
    let privateKey: string | undefined =
      body && typeof body.privateKey === "string" && body.privateKey
        ? body.privateKey
        : undefined;
    const rpcUrl: string =
      (body && typeof body.rpcUrl === "string" && body.rpcUrl) ||
      DEFAULT_RPC_URL;

    if (!apiBaseUrl) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing API base URL",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!privateKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error:
            "Missing demo private key. Paste a Base Sepolia key for this demo call.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!privateKey.startsWith("0x")) {
      privateKey = `0x${privateKey}`;
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`, {
      nonceManager,
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(rpcUrl),
    });

    const fetchWithPay = wrapFetchWithPayment(fetch, walletClient as any);

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

    const response = await fetchWithPay(`${apiBaseUrl}/entities`, {
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



