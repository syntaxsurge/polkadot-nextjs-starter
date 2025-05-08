"use client";

import { FixedSizeBinary } from "polkadot-api";
import { localnode } from "@polkadot-api/descriptors";
import { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";

import { getPapiClient, toHexString } from "./contract-utils";
import { WS_URL } from "./constants";
import { decodeDispatchError } from "./utils";

/**
 * Build common helpers (msg, reviveCall, sendTx) for an Ink! contract.
 *
 * @param destAddress   20-byte hex of the contract account
 * @param contract      Ink client instance returned by `getInkClient`
 */
export function makeInkHelpers<T>(
  destAddress: `0x${string}`,
  contract: T,
) {
  const client = getPapiClient(WS_URL);
  const typedApi = client.getTypedApi(localnode);

  /** Convenience wrapper for message lookup */
  const msg = (label: keyof any) => (contract as any).message(label);

  /** Performs a dry-run call via the Revive pallet and logs in/out. */
  const reviveCall = async (
    caller: string,
    data: FixedSizeBinary<any>,
  ) => {
    /* ───── debug logs ───── */
    // eslint-disable-next-line no-console
    console.log("[reviveCall] ➜", {
      caller,
      dest: destAddress,
      data,
    });

    const response = await typedApi.apis.ReviveApi.call(
      caller,
      FixedSizeBinary.fromHex(destAddress),
      0n,
      undefined,
      undefined,
      data,
    );

    // eslint-disable-next-line no-console
    console.log("[reviveCall] ⇠ response", response);
    return response;
  };

  /** Signs and submits a call, returning a result augmented with `txHash`. */
  const sendTx = async (
    account: InjectedPolkadotAccount,
    data: FixedSizeBinary<any>,
    value: bigint = 0n,
  ) => {
    /* ───── simulate to obtain limits ───── */
    const sim = await reviveCall(account.address, data);

    /* ───── construct extrinsic ───── */
    const tx = typedApi.tx.Revive.call({
      value,
      data,
      dest: FixedSizeBinary.fromHex(destAddress),
      gas_limit: sim.gas_required,
      storage_deposit_limit: sim.storage_deposit.value,
    });

    /* ───── sign & send ───── */
    const result = await tx.signAndSubmit(account.polkadotSigner);

    // eslint-disable-next-line no-console
    console.log("[sendTx] ⇠ result", result);

    if (result.dispatchError) {
      throw new Error(decodeDispatchError(result.dispatchError));
    }

    /* ───── derive tx hash ───── */
    const raw =
      (result as any).txHash ??
      (result as any).extrinsicHash ??
      (result as any).hash ??
      (result as any).hashHex ??
      null;

    const txHashHex = raw ? toHexString(raw) : null;

    // eslint-disable-next-line no-console
    console.log("[sendTx] ⇠ txHash", txHashHex);

    return {
      ...result,
      txHash: txHashHex,
    };
  };

  return { msg, reviveCall, sendTx };
}