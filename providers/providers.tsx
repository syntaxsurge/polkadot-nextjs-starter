"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TxProvider } from "./tx-provider";
import { ExtensionProvider } from "./polkadot-extension-provider";
import { LightClientApiProvider } from "./lightclient-api-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <ExtensionProvider>
          <LightClientApiProvider>
            <TxProvider>{children}</TxProvider>
          </LightClientApiProvider>
        </ExtensionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
