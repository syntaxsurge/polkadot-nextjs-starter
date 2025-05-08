import { FixedSizeBinary, createClient, PolkadotClient } from "polkadot-api";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { decodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

/* ---------- address / hash helpers ---------- */

export function normalizeH160(hex: string): `0x${string}` {
  if (!hex.startsWith("0x")) hex = `0x${hex}`;
  if (hex.length !== 42) throw new Error(`Expected 20-byte (H160) hex, got ${hex}`);
  return hex.toLowerCase() as `0x${string}`;
}

export function toH160Hex(addr: string): `0x${string}` {
  if (addr.startsWith("0x") && addr.length === 42) return normalizeH160(addr);
  return normalizeH160(u8aToHex(decodeAddress(addr).slice(0, 20)));
}

/** Convert an address to FixedSizeBinary<20>. */
export const h160Binary = (addr: string) =>
  FixedSizeBinary.fromHex(toH160Hex(addr)) as FixedSizeBinary<20>;

/** Convert a 32-byte hex to FixedSizeBinary<32>. */
export const hash32Binary = (hex: string) =>
  FixedSizeBinary.fromHex(hex.startsWith("0x") ? hex : `0x${hex}`) as FixedSizeBinary<32>;

/* ---------- misc helpers ---------- */

export const isEmpty = (b: any) =>
  !b ||
  (b instanceof Uint8Array ? b.length === 0 : b.asBytes?.().length === 0);

export function safeDecode<T>(
  fn: (d: any) => T,
  data: any,
  fallback: T,
): T {
  try {
    return fn(data);
  } catch {
    return fallback;
  }
}

/**
 * Convert various binary hash representations into a 0x-prefixed hex string.
 */
export function toHexString(value: unknown): `0x${string}` | null {
  if (!value) return null;

  if (typeof value === "string") {
    return value.startsWith("0x") ? (value as `0x${string}`) : (`0x${value}` as `0x${string}`);
  }

  // FixedSizeBinary & objects exposing toHex()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof value.toHex === "function") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return value.toHex() as `0x${string}`;
  }

  // Objects exposing asBytes()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof value.asBytes === "function") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return u8aToHex(value.asBytes()) as `0x${string}`;
  }

  if (value instanceof Uint8Array) {
    return u8aToHex(value) as `0x${string}`;
  }

  try {
    const str = (value as any).toString();
    if (str && typeof str === "string") {
      return str.startsWith("0x") ? (str as `0x${string}`) : (`0x${str}` as `0x${string}`);
    }
  } catch {
    /* fallthrough */
  }

  return null;
}

/* ---------- singleton Polkadot-API client ---------- */

let _client: PolkadotClient | null = null;
export function getPapiClient(wsUrl: string) {
  if (!_client) {
    _client = createClient(withPolkadotSdkCompat(getWsProvider(wsUrl)));
  }
  return _client;
}