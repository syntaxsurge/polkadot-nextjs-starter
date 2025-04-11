"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient, PolkadotClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import * as smoldot from "smoldot/no-auto-bytecode";

import { start, type Client, type SmoldotBytecode } from "polkadot-api/smoldot";
import { type ChainConfig, type AvailableApis } from "@/papi-config";
import { StatusChange, WsEvent } from "polkadot-api/ws-provider/web";
import { chainConfig } from "../papi-config";

interface LightClientApiProviderType {
  // TODO: Make own type for connectionStatus as it is semantically not correct to reuse the WsEvent type
  connectionStatus: StatusChange | undefined;
  activeChain: ChainConfig;
  setActiveChain: (chain: ChainConfig) => void;
  client: PolkadotClient | null;
  api: AvailableApis | null;
}

const LightClientApiContext = createContext<
  LightClientApiProviderType | undefined
>(undefined);

export function LightClientApiProvider({
  children,
  defaultChain = chainConfig[0],
}: {
  children: React.ReactNode;
  defaultChain?: ChainConfig;
}) {
  const workerRef = useRef<Worker | null>(null);
  const smoldotRef = useRef<Client | null>(null);
  const [activeChain, _setActiveChain] = useState<ChainConfig>(defaultChain);
  const [activeApi, setActiveApi] = useState<AvailableApis | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    StatusChange | undefined
  >(undefined);
  const clientRef = useRef<PolkadotClient | null>(null);

  useEffect(() => {
    // --- main thread way - not suggested ---
    // smoldotRef.current = start();

    // --- web worker way ---
    // TODO: this is using smoldot library directly not via papi and implements a
    // worker in ./worker.ts as described in https://github.com/smol-dot/smoldot
    // papi's smoldot worker implementations are currently not working with next.js
    // change as soon as possible
    const init = async () => {
      workerRef.current = new Worker(new URL("./worker.ts", import.meta.url));

      const bytecode = new Promise<SmoldotBytecode>((resolve) => {
        if (!workerRef.current) return;
        workerRef.current.onmessage = (event) => resolve(event.data);
      });

      const { port1, port2 } = new MessageChannel();
      workerRef.current?.postMessage(port1, [port1]);

      const jsonRpcClient = smoldot.startWithBytecode({
        bytecode,
        portToWorker: port2,
      });
      smoldotRef.current = jsonRpcClient;

      await setActiveChain(defaultChain);
    };

    init();
    // --- end of web worker way ---

    return () => {
      smoldotRef.current?.terminate();
    };
  }, [defaultChain]);

  const setActiveChain = async (newChain: ChainConfig) => {
    try {
      setConnectionStatus({
        type: WsEvent.CONNECTING,
        uri: `via lightclient`,
      });
      if (!newChain.chainSpec || !newChain.chainSpec.name) {
        throw new Error(`Invalid chain spec provided for ${newChain.name}`);
      }

      let chain;

      if (newChain.relayChainSpec) {
        const relayChain = await smoldotRef.current?.addChain({
          chainSpec: JSON.stringify(newChain.relayChainSpec),
        });
        if (!relayChain)
          throw new Error("Failed to add relay chain to light client");
        chain = smoldotRef.current?.addChain({
          chainSpec: JSON.stringify(newChain.chainSpec),
          potentialRelayChains: [relayChain],
        });
      } else {
        chain = await smoldotRef.current?.addChain({
          chainSpec: JSON.stringify(newChain.chainSpec),
        });
      }

      if (!chain) throw new Error("Failed to add chain to light client");

      const lightClient = createClient(getSmProvider(chain));
      clientRef.current = lightClient;
      const typedApi = lightClient.getTypedApi(newChain.descriptors);
      setActiveApi(typedApi);
      _setActiveChain(newChain);

      setConnectionStatus({
        type: WsEvent.CONNECTED,
        uri: `via lightclient`,
      });
    } catch (error) {
      setConnectionStatus({
        type: WsEvent.ERROR,
        event: error,
      });
    }
  };

  return (
    <LightClientApiContext.Provider
      value={{
        connectionStatus,
        api: activeApi,
        client: clientRef.current,
        activeChain,
        setActiveChain,
      }}
    >
      {children}
    </LightClientApiContext.Provider>
  );
}

export function useLightClientApi() {
  const context = useContext(LightClientApiContext);
  if (!context) {
    throw new Error(
      "useLightClientApi must be used within a LightClientApiProvider",
    );
  }
  return context;
}
