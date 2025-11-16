"use client";

import React from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";

export function ConnectWalletButton() {
  const { address, isConnecting, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const hasInjected = connectors.length > 0;
  const onBaseSepolia = isConnected && chainId === baseSepolia.id;

  const handleConnect = () => {
    const connector = connectors[0];
    if (!connector) return;

    connect({ connector, chainId: baseSepolia.id });
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: baseSepolia.id });
  };

  if (!hasInjected) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        disabled
      >
        No browser wallet detected
      </button>
    );
  }

  if (isConnected && address && !onBaseSepolia) {
    const short =
      address.slice(0, 6) + "…" + address.slice(address.length - 4);

    return (
      <button
        type="button"
        onClick={handleSwitchChain}
        disabled={isSwitching}
        className="inline-flex items-center justify-center rounded-md border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-70"
      >
        {isSwitching
          ? "Switching to Base Sepolia…"
          : `Connected ${short} – switch to Base Sepolia`}
      </button>
    );
  }

  if (isConnected && address && onBaseSepolia) {
    const short =
      address.slice(0, 6) + "…" + address.slice(address.length - 4);

    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="inline-flex items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
      >
        Connected: {short} (Base Sepolia)
      </button>
    );
  }

  const isPending = isConnecting || connectStatus === "pending";

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md border border-pink-500 bg-pink-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-pink-700 disabled:opacity-70"
    >
      {isPending ? "Connecting…" : "Connect wallet (Base Sepolia)"}
    </button>
  );
}


