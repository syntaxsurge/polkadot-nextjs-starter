"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  grantIssuerRole,
  mintCredential,
  updateCredential,
  revokeCredential,
  ownerOf,
  tokenUri,
  vcHash as vcHashQuery,
} from "@/lib/credential-nft";
import { usePolkadotExtension } from "@/providers/polkadot-extension-provider";
import { buildExplorerLink, ensureSigner } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*                                 types                              */
/* ------------------------------------------------------------------ */

type Action =
  | "grantIssuerRole"
  | "mintCredential"
  | "updateCredential"
  | "revokeCredential"
  | "ownerOf"
  | "tokenUri"
  | "vcHash";

/* ------------------------------------------------------------------ */

export default function CredentialNftPage() {
  const { selectedAccount, isInitializing } = usePolkadotExtension();

  /* ----------------------------- state ------------------------------ */
  const [selectedAction, setSelectedAction] =
    useState<Action>("grantIssuerRole");

  /* inputs */
  const [issuerAddr, setIssuerAddr] = useState("");
  const [toAddr, setToAddr] = useState("");
  const [vcHashValue, setVcHashValue] = useState("");
  const [uri, setUri] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [newVcHash, setNewVcHash] = useState("");
  const [newUri, setNewUri] = useState("");

  /* outputs */
  const [queryResult, setQueryResult] = useState<any>(null);
  const [explorerLink, setExplorerLink] = useState<string | null>(null);

  const [isBusy, setIsBusy] = useState(false);

  /* ------------------------- submission ---------------------------- */

  const handleSubmit = async () => {
    try {
      ensureSigner(selectedAccount);
      setIsBusy(true);
      setExplorerLink(null);

      switch (selectedAction) {
        case "grantIssuerRole": {
          const res = await grantIssuerRole({
            account: selectedAccount!,
            issuer: issuerAddr,
          });
          toast.success("Issuer role granted!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "mintCredential": {
          const res = await mintCredential({
            account: selectedAccount!,
            to: toAddr,
            vcHash: vcHashValue,
            uri,
          });
          toast.success("Credential minted!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "updateCredential": {
          const res = await updateCredential({
            account: selectedAccount!,
            tokenId: BigInt(tokenId),
            newVcHash,
            newUri,
          });
          toast.success("Credential updated!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "revokeCredential": {
          const res = await revokeCredential({
            account: selectedAccount!,
            tokenId: BigInt(tokenId),
          });
          toast.success("Credential revoked!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "ownerOf": {
          const owner = await ownerOf({
            account: selectedAccount!,
            tokenId: BigInt(tokenId),
          });
          setQueryResult({ owner });
          break;
        }

        case "tokenUri": {
          const tokenUriRes = await tokenUri({
            account: selectedAccount!,
            tokenId: BigInt(tokenId),
          });
          setQueryResult({ tokenUri: tokenUriRes });
          break;
        }

        case "vcHash": {
          const vcHashRes = await vcHashQuery({
            account: selectedAccount!,
            tokenId: BigInt(tokenId),
          });
          setQueryResult({ vcHash: vcHashRes });
          break;
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsBusy(false);
    }
  };

  /* -------------------- dynamic fields per action ------------------- */

  const fieldsForAction: Record<Action, React.ReactNode> = useMemo(
    () => ({
      grantIssuerRole: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Issuer Address (H160 / SS58)
          </span>
          <input
            type="text"
            value={issuerAddr}
            onChange={(e) => setIssuerAddr(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="0x… / 5…"
          />
        </label>
      ),
      mintCredential: (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Recipient Address (H160 / SS58)
            </span>
            <input
              type="text"
              value={toAddr}
              onChange={(e) => setToAddr(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="0x… / 5…"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">VC Hash (0x…32-byte)</span>
            <input
              type="text"
              value={vcHashValue}
              onChange={(e) => setVcHashValue(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="0x…"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">URI</span>
            <input
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="ipfs://…"
            />
          </label>
        </>
      ),
      updateCredential: (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Token ID</span>
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="e.g. 1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">New VC Hash</span>
            <input
              type="text"
              value={newVcHash}
              onChange={(e) => setNewVcHash(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="0x…"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">New URI</span>
            <input
              type="text"
              value={newUri}
              onChange={(e) => setNewUri(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="ipfs://…"
            />
          </label>
        </>
      ),
      revokeCredential: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Token ID</span>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g. 1"
          />
        </label>
      ),
      ownerOf: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Token ID</span>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g. 1"
          />
        </label>
      ),
      tokenUri: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Token ID</span>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g. 1"
          />
        </label>
      ),
      vcHash: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Token ID</span>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g. 1"
          />
        </label>
      ),
    }),
    [
      issuerAddr,
      toAddr,
      vcHashValue,
      uri,
      tokenId,
      newVcHash,
      newUri,
    ],
  );

  /* ------------------------------------------------------------------ */

  if (isInitializing) return <Skeleton className="h-10 w-full" />;

  return (
    <main className="container mx-auto max-w-xl p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Credential NFT</h1>

      {!selectedAccount ? (
        <p className="text-muted-foreground">
          Please connect a wallet and select an account.
        </p>
      ) : (
        <>
          {/* ---------------------- ACTION SELECTION --------------------- */}
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Select Action</span>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value as Action);
                  setQueryResult(null);
                  setExplorerLink(null);
                }}
                className="w-full rounded-md border px-3 py-2 bg-background"
              >
                <option value="grantIssuerRole">Grant Issuer Role</option>
                <option value="mintCredential">Mint Credential</option>
                <option value="updateCredential">Update Credential</option>
                <option value="revokeCredential">Revoke Credential</option>
                <optgroup label="Queries">
                  <option value="ownerOf">Owner Of</option>
                  <option value="tokenUri">Token URI</option>
                  <option value="vcHash">VC Hash</option>
                </optgroup>
              </select>
            </label>

            {/* ------------------- CONTEXTUAL FIELDS ------------------- */}
            {fieldsForAction[selectedAction]}

            {/* ----------------------- SUBMIT ------------------------- */}
            <Button
              onClick={handleSubmit}
              disabled={isBusy}
              className="w-full sm:w-auto"
            >
              {isBusy ? "Working…" : "Execute"}
            </Button>
          </div>

          {/* ------------------------- RESULTS ------------------------ */}
          {queryResult && (
            <div className="mt-6">
              <h2 className="font-semibold">Query Result</h2>
              <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
{JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          )}

          {explorerLink && (
            <div className="mt-6">
              <h2 className="font-semibold">Explorer Link</h2>
              <a
                href={explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {explorerLink}
              </a>
            </div>
          )}
        </>
      )}
    </main>
  );
}