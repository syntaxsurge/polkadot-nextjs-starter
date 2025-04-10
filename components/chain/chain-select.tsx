"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chainConfig } from "@/papi-config";
import { useLightClientApi } from "@/providers/lightclient-api-provider";
import { StatusChange, WsEvent } from "polkadot-api/ws-provider/web";
import { Loader2 } from "lucide-react";

export function ChainSelect() {
  const { setActiveChain, activeChain, connectionStatus } = useLightClientApi();

  if (connectionStatus?.type === WsEvent.ERROR || !activeChain) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Loader2 className="w-4 h-4 animate-spin" />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <>
            {connectionStatus?.type === WsEvent.CONNECTED ? (
              activeChain?.icon
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Chain</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={activeChain?.key}
          onValueChange={(value) => {
            const newChain = chainConfig.find((chain) => chain.key === value);
            if (newChain) {
              setActiveChain(newChain);
            }
          }}
        >
          {chainConfig.map((chain) => (
            <DropdownMenuRadioItem key={chain.key} value={chain.key}>
              {chain.icon}
              {chain.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
