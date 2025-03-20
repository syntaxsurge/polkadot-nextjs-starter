import { fontUnbounded } from "@/fonts";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen p-8 pb-20 flex-col gap-[32px] row-start-2 items-center justify-center relative">
      <h1
        className={cn(
          "text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground/70 via-foreground to-foreground/70",
          fontUnbounded.className
        )}
      >
        Polkadot Next.js Starter
      </h1>
      <p>A starter project for building a Polkadot dApp with Next.js.</p>
    </main>
  );
}
