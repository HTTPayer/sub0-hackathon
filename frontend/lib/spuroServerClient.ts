import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

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
    "[spuroServerClient] Missing SPURO_DEMO_PRIVATE_KEY / CLIENT_PRIVATE_KEY / PRIVATE_KEY env – paid Spuro calls will fail without credentials."
  );
}

let fetchWithPaySingleton:
  | ((input: RequestInfo, init?: RequestInit) => Promise<Response>)
  | null = null;

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getFetchWithPay() {
  if (!PRIVATE_KEY || PRIVATE_KEY === "0x") {
    throw new Error(
      "Spuro demo private key is not configured. Set SPURO_DEMO_PRIVATE_KEY or CLIENT_PRIVATE_KEY."
    );
  }

  if (!fetchWithPaySingleton) {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`, {
      nonceManager,
    });

    const client = createWalletClient({
      account,
      transport: http(RPC_URL),
      chain: baseSepolia,
    });

    fetchWithPaySingleton = wrapFetchWithPayment(fetch, client);
  }

  return fetchWithPaySingleton;
}


