import Link from "next/link";
import { WalletSelect } from "../account/wallet-select";
import { ThemeToggle } from "./theme-toggle";

export default function Nav() {
  return (
    <nav className="fixed top-0 px-8 py-4 z-20 w-full flex items-center justify-between gap-2">
      <Link href="/" className="font-bold">
        Polkadot Starter
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <WalletSelect />
      </div>
    </nav>
  );
}
