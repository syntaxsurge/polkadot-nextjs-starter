"use client";

import { useLightClientApi } from "@/providers/lightclient-api-provider";
import { useEffect, useState } from "react";

export function useBlockNumber() {
  const { client, connectionStatus } = useLightClientApi();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!client) return;
    const subscription = client.finalizedBlock$.subscribe((value) => {
      setBlockNumber(value.number);
    });
    return () => subscription?.unsubscribe();
  }, [client]);

  return blockNumber;
}
