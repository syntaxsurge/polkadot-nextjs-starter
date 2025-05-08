"use client";

import { contracts } from "@polkadot-api/descriptors";
import { getInkClient } from "polkadot-api/ink";
import { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { u8aToHex } from "@polkadot/util";

import {
  h160Binary,
  hash32Binary,
  isEmpty,
  safeDecode,
} from "./contract-utils";
import { makeInkHelpers } from "./ink-helpers";
import { DID_CONTRACT_ADDRESS } from "./constants";

/* ---------- contract instance & helpers ---------- */
const didRegistry = getInkClient(contracts.did_registry);
const { msg, reviveCall, sendTx } = makeInkHelpers(
  DID_CONTRACT_ADDRESS,
  didRegistry,
);

/* ---------- reads ---------- */
export const hasDid = async ({
  account,
  owner,
}: {
  account: InjectedPolkadotAccount;
  owner: string;
}) => {
  const data = msg("has_did").encode({ owner: h160Binary(owner) });
  const resp = await reviveCall(account.address, data);
  if (!resp.result.success || isEmpty(resp.result.value)) return false;
  return safeDecode(msg("has_did").decode, resp.result.value, {
    success: false,
    value: false,
  }).value;
};

export const documentOf = async ({
  account,
  owner,
}: {
  account: InjectedPolkadotAccount;
  owner: string;
}) => {
  const data = msg("document_of").encode({ owner: h160Binary(owner) });
  const resp = await reviveCall(account.address, data);
  if (!resp.result.success || isEmpty(resp.result.value)) return null;
  return safeDecode(msg("document_of").decode, resp.result.value, {
    success: false,
    value: null,
  }).value;
};

export const getDidOwners = async ({
  account,
  start = 0,
  count = 50,
}: {
  account: InjectedPolkadotAccount;
  start?: number;
  count?: number;
}) => {
  const data = msg("get_did_owners").encode({
    start_index: start,
    count,
  });
  const resp = await reviveCall(account.address, data);
  if (!resp.result.success || isEmpty(resp.result.value)) return [];
  const decoded: any[] = safeDecode(
    msg("get_did_owners").decode,
    resp.result.value,
    {
      success: false,
      value: [],
    },
  ).value;
  return decoded.map((h160: any) =>
    u8aToHex(h160.asBytes ? h160.asBytes() : h160) as `0x${string}`,
  );
};

/* ---------- transactions ---------- */
export const createDid = async ({
  account,
  docHash,
}: {
  account: InjectedPolkadotAccount;
  docHash: string;
}) =>
  sendTx(
    account,
    msg("create_did").encode({ doc_hash: hash32Binary(docHash) }),
  );

export const setDocument = async ({
  account,
  uri,
  docHash,
}: {
  account: InjectedPolkadotAccount;
  uri: string;
  docHash: string;
}) =>
  sendTx(
    account,
    msg("set_document").encode({
      uri,
      doc_hash: hash32Binary(docHash),
    }),
  );