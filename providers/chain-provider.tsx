"use client";

import { createClient, PolkadotClient } from "polkadot-api";
import {
  getWsProvider,
  StatusChange,
  WsJsonRpcProvider,
} from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  chainConfig,
  type ChainConfig,
  type AvailableApis,
} from "@/papi-config";

interface ChainProviderType {
  connectionStatus: StatusChange | undefined;
  activeChain: ChainConfig | null;
  setActiveChain: (chain: ChainConfig) => void;
  client: PolkadotClient | null;
  wsProvider: WsJsonRpcProvider | null;
  api: AvailableApis | null;
}

const ChainContext = createContext<ChainProviderType | undefined>(undefined);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const wsProviderRef = useRef<WsJsonRpcProvider | null>(null);
  const [activeChain, _setActiveChain] = useState<ChainConfig | null>(null);
  const [activeApi, setActiveApi] = useState<AvailableApis | null>(null);
  const clientRef = useRef<PolkadotClient | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<
    StatusChange | undefined
  >(undefined);

  useEffect(() => {
    setActiveChain(chainConfig[0]);
  }, []);

  const setActiveChain = (newChain: ChainConfig) => {
    try {
      // Check for custom endpoint in URL, fallback to chain's default endpoints
      const wsEndpoint = handleWsEndpoint({
        defaultEndpoint: newChain.endpoints[0],
      });
      const endpoints = [wsEndpoint, ...newChain.endpoints.slice(1)];

      const _wsProvider = getWsProvider(endpoints, setConnectionStatus);

      wsProviderRef.current = _wsProvider;

      const client = createClient(withPolkadotSdkCompat(_wsProvider));
      const api = client.getTypedApi(newChain.descriptors);

      clientRef.current = client;
      setActiveApi(api);
      _setActiveChain(newChain);
    } catch (error) {
      console.error("Error connecting to chain", error);
    }
  };

  return (
    <ChainContext.Provider
      value={{
        connectionStatus,
        api: activeApi,
        wsProvider: wsProviderRef.current,
        client: clientRef.current,
        activeChain,
        setActiveChain,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error("useChain must be used within a ChainProvider");
  }
  return context;
}

/**
 * Get or set the WebSocket endpoint from URL search params
 * Default endpoint will be used if none is specified
 */
export function handleWsEndpoint({
  defaultEndpoint = "wss://rpc-polkadot.luckyfriday.io",
}: {
  defaultEndpoint?: string;
} = {}) {
  if (typeof window === "undefined") return defaultEndpoint;

  const params = new URLSearchParams(window.location.search);
  const wsEndpoint = params.get("rpc");

  if (!wsEndpoint) return defaultEndpoint;

  // Validate endpoint is a valid WSS URL
  try {
    const url = new URL(wsEndpoint);
    if (url.protocol !== "wss:") return defaultEndpoint;
    return wsEndpoint;
  } catch {
    return defaultEndpoint;
  }
}
