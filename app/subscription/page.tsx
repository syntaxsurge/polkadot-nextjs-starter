"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  setPlanPrice,
  paySubscription,
  priceOf,
  paidUntil,
} from "@/lib/subscription-manager";
import { usePolkadotExtension } from "@/providers/polkadot-extension-provider";
import {
  buildExplorerLink,
  ensureSigner,
  stringifyWithBigInt,
} from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*                                 types                              */
/* ------------------------------------------------------------------ */

type Action = "setPlanPrice" | "paySubscription" | "priceOf" | "paidUntil";

/* ------------------------------------------------------------------ */

export default function SubscriptionManagerPage() {
  const { selectedAccount, isInitializing } = usePolkadotExtension();

  /* ----------------------------- state ------------------------------ */
  const [selectedAction, setSelectedAction] =
    useState<Action>("setPlanPrice");

  /* inputs */
  const [planKey, setPlanKey] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [teamAddr, setTeamAddr] = useState("");
  const [payValue, setPayValue] = useState("");

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
      setQueryResult(null);

      switch (selectedAction) {
        case "setPlanPrice": {
          const res = await setPlanPrice({
            account: selectedAccount!,
            planKey: Number(planKey),
            newPrice: BigInt(newPrice),
          });
          toast.success("Plan price updated!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "paySubscription": {
          const res = await paySubscription({
            account: selectedAccount!,
            team: teamAddr,
            planKey: Number(planKey),
            value: BigInt(payValue),
          });
          toast.success("Subscription paid!");
          const hash = (res as any)?.block?.hash;
          if (hash) setExplorerLink(buildExplorerLink(hash));
          break;
        }

        case "priceOf": {
          const price = await priceOf({
            account: selectedAccount!,
            planKey: Number(planKey),
          });
          setQueryResult({ price });
          break;
        }

        case "paidUntil": {
          const timestamp = await paidUntil({
            account: selectedAccount!,
            team: teamAddr,
          });
          setQueryResult({ paidUntil: timestamp });
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
      setPlanPrice: (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Plan Key (u8)</span>
            <input
              type="number"
              value={planKey}
              onChange={(e) => setPlanKey(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="e.g. 1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">New Price (in Wei)</span>
            <input
              type="text"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="e.g. 1000000000000000000"
            />
          </label>
        </>
      ),
      paySubscription: (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Team Address (H160 / SS58)</span>
            <input
              type="text"
              value={teamAddr}
              onChange={(e) => setTeamAddr(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="0x… / 5…"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Plan Key (u8)</span>
            <input
              type="number"
              value={planKey}
              onChange={(e) => setPlanKey(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="e.g. 1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Payment Value (Wei)</span>
            <input
              type="text"
              value={payValue}
              onChange={(e) => setPayValue(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="e.g. 1000000000000000000"
            />
          </label>
        </>
      ),
      priceOf: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Plan Key (u8)</span>
          <input
            type="number"
            value={planKey}
            onChange={(e) => setPlanKey(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="e.g. 1"
          />
        </label>
      ),
      paidUntil: (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Team Address (H160 / SS58)</span>
          <input
            type="text"
            value={teamAddr}
            onChange={(e) => setTeamAddr(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="0x… / 5…"
          />
        </label>
      ),
    }),
    [planKey, newPrice, teamAddr, payValue],
  );

  /* ------------------------------------------------------------------ */

  if (isInitializing) return <Skeleton className="h-10 w-full" />;

  return (
    <main className="container mx-auto max-w-xl p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Subscription Manager</h1>

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
                <option value="setPlanPrice">Set Plan Price</option>
                <option value="paySubscription">Pay Subscription</option>
                <optgroup label="Queries">
                  <option value="priceOf">Price Of</option>
                  <option value="paidUntil">Paid Until</option>
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
{stringifyWithBigInt(queryResult)}
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