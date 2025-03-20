import Link from "next/link";
import { PolkadotLogo } from "../ui/polkadot-logo";

const footerLinks = [
  {
    title: "Resources",
    links: [
      { name: "Papi docs", href: "https://papi.how" },
      { name: "Polkadot docs", href: "https://docs.polkadot.com/" },
      { name: "Next.js docs", href: "https://nextjs.org/docs" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-3">
            <Link href="/" className="text-2xl font-bold dark:text-white">
              Polkadot next.js Starter
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-lg">
              A starter project for building Polkadot dApps with Next.js.
            </p>
          </div>
          {footerLinks.map((category) => (
            <div key={category.title} className="text-right">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {category.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 text-center w-full flex flex-col items-center justify-center gap-4">
          <PolkadotLogo />
          <a
            className="hidden sm:block"
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fniklasp%2Fpolkadot-nextjs-starter&project-name=polkadot-nextjs-starter&repository-name=polkadot-nextjs-starter&demo-title=Polkadot%20Next.js%20Starter%20&demo-description=A%20template%20to%20get%20started%20building%20apps%20powered%20by%20Polkadot&demo-url=https%3A%2F%2Fpolkadot-nextjs-starter.vercel.app&demo-image=https%3A%2F%2Fpolkadot-nextjs-starter.vercel.app%2Fpolkadot-nextjs-starter.png"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://vercel.com/button" alt="Deploy with Vercel" />
          </a>
        </div>
      </div>
    </footer>
  );
}
