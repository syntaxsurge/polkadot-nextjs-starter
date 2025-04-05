"use client";

import {
  polkadot,
  polkadot_asset_hub,
  paseo,
  paseo_asset_hub,
} from "@polkadot-api/descriptors";
import type { TypedApi } from "polkadot-api";
import { logos } from "@/icons/logos";
export interface ChainConfig {
  key: string;
  name: string;
  descriptors:
    | typeof polkadot
    | typeof polkadot_asset_hub
    | typeof paseo
    | typeof paseo_asset_hub;
  endpoints: string[];
  explorerUrl?: string;
  icon?: React.ReactNode;
  chainSpec?: { name: string; genesisHash: string; properties: any };
  properties: {
    tokenDecimals: number;
    tokenSymbol: string;
  };
}

export type AvailableApis =
  | TypedApi<typeof polkadot>
  | TypedApi<typeof polkadot_asset_hub>
  | TypedApi<typeof paseo>
  | TypedApi<typeof paseo_asset_hub>;

export const chainConfig: ChainConfig[] = [
  {
    key: "polkadot",
    name: "Polkadot",
    descriptors: polkadot,
    endpoints: ["wss://rpc.polkadot.io"],
    icon: logos.polkadot,
    properties: {
      tokenDecimals: 10,
      tokenSymbol: "DOT",
    },
  },
  {
    key: "polkadot_asset_hub",
    name: "Polkadot Asset Hub",
    descriptors: polkadot_asset_hub,
    endpoints: [
      "wss://polkadot-asset-hub-rpc.polkadot.io",
      "wss://statemint.api.onfinality.io/public-ws",
    ],
    icon: logos.assetHub,
    properties: {
      tokenDecimals: 10,
      tokenSymbol: "DOT",
    },
  },
  {
    key: "paseo",
    name: "Paseo",
    descriptors: paseo,
    endpoints: ["wss://rpc.ibp.network/paseo"],
    icon: logos.paseo,
    properties: {
      tokenDecimals: 10,
      tokenSymbol: "PAS",
    },
  },
  {
    key: "paseo_asset_hub",
    name: "Paseo Asset Hub",
    descriptors: paseo_asset_hub,
    endpoints: ["wss://asset-hub-paseo-rpc.dwellir.com"],
    icon: logos.paseoAssethub,
    properties: {
      tokenDecimals: 10,
      tokenSymbol: "PAS",
    },
  },
];
