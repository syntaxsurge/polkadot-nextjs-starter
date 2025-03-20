"use client";

import { dot } from "@polkadot-api/descriptors";
import type { TypedApi } from "polkadot-api";

export interface ChainConfig {
  key: string;
  name: string;
  descriptors: typeof dot;
  endpoints: string[];
  explorerUrl?: string;
}

export type AvailableApis = TypedApi<typeof dot>;

export const chainConfig: ChainConfig[] = [
  {
    key: "casinojam",
    name: "CasinoJam",
    descriptors: dot,
    endpoints: ["ws://127.0.0.1:9944"],
  },
];
