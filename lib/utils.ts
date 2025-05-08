import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { WS_URL } from "./constants";

/* ------------------------------------------------------------------ */
/*                         class & style helpers                      */
/* ------------------------------------------------------------------ */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/*                          account helpers                           */
/* ------------------------------------------------------------------ */

/**
 * Ensure the user has selected an account before proceeding.
 * Throws an error when the account is null/undefined.
 */
export function ensureSigner(
  account: { address: string } | null | undefined,
): asserts account {
  if (!account) throw new Error("Connect a wallet account first.");
}

/* ------------------------------------------------------------------ */
/*                      blockchain-specific helpers                   */
/* ------------------------------------------------------------------ */

/** Build a Polkadot-JS Apps explorer link for a given transaction hash. */
export function buildExplorerLink(hash: string): string {
  return `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
    WS_URL,
  )}#/explorer/query/${hash}`;
}

/* ------------------------------------------------------------------ */
/*                           misc helpers                             */
/* ------------------------------------------------------------------ */

export function trimAddress(address: string, length = 4) {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function stringifyWithBigInt(obj: unknown) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}

// Helper to format the date nicely
export function formatLastUpdated(date?: Date): string {
  if (!date) return "Not yet updated";

  // Format as time if it's today
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  // Full date and time for older updates
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied to clipboard"))
    .catch(() => toast.error("Failed to copy text"));
}

export function buildLink(
  basePath: string,
  init: Record<string, string>,
  overrides: Record<string, unknown>,
) {
  const sp = new URLSearchParams(init);
  Object.entries(overrides).forEach(([k, v]) => sp.set(k, String(v)));
  Array.from(sp.entries()).forEach(([k, v]) => {
    if (v === "") sp.delete(k);
  });
  const qs = sp.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

/**
 * Convert enum-like or snake_case strings to human-readable lowercase text.
 * e.g. "PENDING_APPROVAL" → "pending approval".
 */
export function prettify(text?: string | null): string {
  return text ? text.replaceAll("_", " ").toLowerCase() : "—";
}

/**
 * Decode a Polkadot dispatch error into a human-readable string.
 * Falls back to the error type when module metadata is unavailable.
 */
export function decodeDispatchError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const err = error as any;

  // Non-module errors return their type directly.
  if (err.type && err.type !== "Module") return err.type;

  // Try to read pallet & error names from the module field.
  const mod = err.module;
  if (mod) {
    const pallet = mod.pallet ?? mod.section ?? "UnknownModule";
    const name = mod.name ?? mod.error ?? "UnknownError";
    return `${pallet}.${name}`;
  }
  return "Module error";
}