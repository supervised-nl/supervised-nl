import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";
import { LogoutButton } from "@/components/logout-button";
import { headerNavLinkClass } from "@/lib/ui";

export function AppHeader({ homeHref, qaHref }: { homeHref: string; qaHref?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b border-supervised-rule bg-[rgba(2,22,2,0.85)] px-[clamp(1.236rem,3vw,2.618rem)] pt-[1.618rem] pb-4 backdrop-blur-sm">
      <Link
        href={homeHref}
        className="flex items-center gap-[0.382rem] leading-none opacity-80 transition-opacity hover:opacity-100"
      >
        <LogoMark className="h-[1rem] w-[1rem] shrink-0 text-supervised-ink-1" />
        <span className="text-supervised-xs leading-none font-normal tracking-[0.02em] text-supervised-ink-2 lowercase">
          supervised coach
        </span>
      </Link>
      <div className="flex items-center gap-[0.618rem] sm:gap-[1rem]">
        {qaHref ? (
          <Link href={qaHref} className={headerNavLinkClass}>
            vraagbaak
          </Link>
        ) : null}
        <Link href="/account" className={headerNavLinkClass}>
          account
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
