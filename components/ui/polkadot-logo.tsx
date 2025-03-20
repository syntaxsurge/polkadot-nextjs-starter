"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function PolkadotLogo() {
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return "Powered by Polkadot";

  const logo =
    theme === "dark"
      ? "/Polkadot_Logo_Horizontal_Pink_White.svg"
      : "/Polkadot_Logo_Horizontal_Pink_Black.svg";

  return (
    <Link
      href="https://polkadot.network"
      target="_blank"
      className="items-center inline-block"
    >
      <div className="flex items-center">
        <span className="text-sm font-light">Powered by</span>
        <Image src={logo} alt="Polkadot Logo" width={100} height={28} />
      </div>
    </Link>
  );
}
