"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  createDid,
  documentOf,
  hasDid,
  setDocument,
  getDidOwners,
} from "@/lib/did-registry";
import { usePolkadotExtension } from "@/providers/polkadot-extension-provider";
import { buildExplorerLink, ensureSigner } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*                                 types                              */
/* ------------------------------------------------------------------ */

type Action = "createDid" | "setDocument" | "checkDid" | "listOwners";

/* ------------------------------------------------------------------ */

export default function DidRegistryPage() {
  const { selectedAccount, isInitializing } = usePolkadotExtension();

  /* ----------------------------- state ------------------------------ */
  const [selectedAction, setSelectedAction] = useState<Action>("createDid");

  /* inputs */
  const [docHash, setDocHash] = useState("");
  const [uri, setUri] = useState("");
  const [ownerAddr, setOwnerAddr] = useState("");

  /* outputs */
  const [didExists, setDidExists] = useState<boolean | null>(null);
  const [document, setDocumentState] = useState<any>(null);
  const [owners, setOwners] = useState<string[]>([]);
  const [explorerLink, setExplorerLink] = useState<string | null>(null);

  const [isBusy, setIsBusy] = useState(false);

  /* ------------------------- submission ---------------------------- */

  const handleSubmit = async () => {
    try {
      ensureSigner(selectedAccount);
      setIsBusy(true);
      setExplorerLink(null);

      switch (selectedAction) {
        case "createDid": {
          const res = await createDid({ account: selectedAccount!, docHash });
          // eslint-disable-next-line no-console
          console.log("[createDid] result", res);
          toast.success("DID created!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "setDocument": {
          const res = await setDocument({
            account: selectedAccount!,
            uri,
            docHash,
          });
          // eslint-disable-next-line no-console
          console.log("[setDocument] result", res);
          toast.success("Document updated!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "checkDid": {
          const target = ownerAddr.trim()
            ? ownerAddr.trim()
            : selectedAccount!.address;
          const exists = await hasDid({
            account: selectedAccount!,
            owner: target,
          });
          setDidExists(exists);

          if (exists) {
            const doc = await documentOf({
              account: selectedAccount!,
              owner: target,
            });
            setDocumentState(doc);
          } else {
            setDocumentState(null);
          }
          break;
        }

        case "listOwners": {
          const batch = 50;
          let index = 0;
          const all: string[] = [];
          while (true) {
            const chunk = await getDidOwners({
              account: selectedAccount!,
              start: index,
              count: batch,
            });
            if (!chunk.length) break;
            all.push(...chunk);
            if (chunk.length < batch) break;
            index += batch;
          }
          setOwners(all);
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
      createDid: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Document Hash (0x…)</span>
          <input
            type="text"
            value={docHash}
            onChange={(e) => setDocHash(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="0x…32-byte hash"
          />
        </label>
      ),
      setDocument: (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Document Hash (0x…)</span>
            <input
              type="text"
              value={docHash}
              onChange={(e) => setDocHash(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="0x…32-byte hash"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Document URI</span>
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
      checkDid: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Owner Address (leave blank to use your account)
          </span>
          <input
            type="text"
            value={ownerAddr}
            onChange={(e) => setOwnerAddr(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="0x…H160 or SS58"
          />
        </label>
      ),
      listOwners: (
        <p className="text-muted-foreground">
          This action returns the full list of DID owners. No additional
          parameters are required.
        </p>
      ),
    }),
    [docHash, uri, ownerAddr],
  );

  /* ------------------------------------------------------------------ */

  if (isInitializing) return <Skeleton className="h-10 w-full" />;

  return (
    <main className="container mx-auto max-w-xl p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">DID Registry</h1>

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
                  setDidExists(null);
                  setDocumentState(null);
                  setOwners([]);
                  setExplorerLink(null);
                }}
                className="w-full rounded-md border px-3 py-2 bg-background"
              >
                <option value="createDid">Create DID</option>
                <option value="setDocument">Set Document</option>
                <option value="checkDid">Check DID</option>
                <option value="listOwners">List Owners</option>
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

            {/* --------------------- EXPLORER LINK -------------------- */}
            {explorerLink && (
              <div className="mt-4">
                <h2 className="font-semibold">Transaction Hash</h2>
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
          </div>

          {/* ------------------------- RESULTS ------------------------ */}
          {(didExists !== null || owners.length > 0) && (
            <div className="mt-6">
              <h2 className="font-semibold">Query Result</h2>
              <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
{JSON.stringify({ didExists, document, owners }, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </main>
  );
}