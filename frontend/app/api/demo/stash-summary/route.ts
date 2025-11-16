import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";
import {
  decodePayload,
  queryEntities,
  type QueryEntitiesResponse,
} from "spuro-functions";

export const dynamic = "force-dynamic";

const DEFAULT_API_BASE_URL =
  process.env.SPURO_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org";

const DEFAULT_RPC_URL = "https://sepolia.base.org";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const stash: string | null =
    body && typeof body.stash === "string" ? body.stash : null;

  if (!stash) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing stash parameter",
        reason: "missing-stash",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const apiBaseUrl: string =
    (body && typeof body.apiBaseUrl === "string" && body.apiBaseUrl) ||
    DEFAULT_API_BASE_URL;
  let privateKey: string | undefined =
    body && typeof body.privateKey === "string" && body.privateKey
      ? body.privateKey
      : undefined;
  const rpcUrl: string =
    (body && typeof body.rpcUrl === "string" && body.rpcUrl) || DEFAULT_RPC_URL;

  if (!apiBaseUrl) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing API base URL",
        reason: "missing-api-base-url",
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
        reason: "missing-private-key",
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

  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`, {
      nonceManager,
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(rpcUrl),
    });

    const fetchWithPay = wrapFetchWithPayment(fetch, walletClient as any);

    const query = `type = "polkadot-stash" AND stash_address = "${stash}"`;

    const data: QueryEntitiesResponse = await queryEntities(
      fetchWithPay as unknown as typeof fetch,
      apiBaseUrl,
      {
        query,
        limit: 1,
        include_payload: true,
      }
    );

    if (!data.results.length) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "No snapshot found for this stash",
          reason: "no-snapshot",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = data.results[0];
    let snapshot: any = null;

    if (result.payload) {
      try {
        const decoded = decodePayload(result.payload);
        snapshot = JSON.parse(decoded);
      } catch {
        snapshot = null;
      }
    }

    const summary = {
      entity_key: result.key,
      attributes: result.attributes || {},
      snapshot,
      balance: snapshot?.balance ?? null,
      activeEra: snapshot?.activeEra ?? null,
      timestamp: (result.attributes as any)?.timestamp ?? null,
    };

    return new Response(
      JSON.stringify({
        ok: true,
        stash,
        summary,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[demo/stash-summary] Unexpected error:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || "Unexpected error",
        reason: "unexpected",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

