"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export function PolkadotLogo() {
  const { theme } = useTheme();

  return (
    <Link
      href="https://polkadot.network"
      target="_blank"
      className="flex items-center inline-block"
    >
      <div className="flex items-center">
        <span className="text-sm font-light">Powered by</span>
        <Image
          src={
            theme === "dark"
              ? "/Polkadot_Logo_Horizontal_Pink_White.svg"
              : "/Polkadot_Logo_Horizontal_Pink_Black.svg"
          }
          alt="Polkadot Logo"
          width={100}
          height={28}
          unoptimized
        />
      </div>
    </Link>
  );
}
