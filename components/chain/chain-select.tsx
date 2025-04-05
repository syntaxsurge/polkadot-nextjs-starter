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
import { useChain } from "@/providers/chain-provider";

export function ChainSelect() {
  const { setActiveChain, activeChain } = useChain();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {activeChain?.icon || "Select Chain"}
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
