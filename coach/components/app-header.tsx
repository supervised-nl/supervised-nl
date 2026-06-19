import Link from "next/link";

import { HeaderNav } from "@/components/header-nav";
import { LogoMark } from "@/components/logo-mark";
import { LogoutButton } from "@/components/logout-button";
import { getUser } from "@/lib/auth";
import { getMemberNavLinks } from "@/lib/nav";
import { roleHome } from "@/lib/role-home";
import { headerNavLinkClass } from "@/lib/ui";

export async function AppHeader() {
  const user = await getUser();
  const homeHref = user ? roleHome(user.role) : "/";
  const navLinks = user ? getMemberNavLinks(user.role) : undefined;

  return (
    <header className="fixed inset-x-0 top-0 z-10 border-b border-supervised-rule bg-[rgba(2,22,2,0.85)] backdrop-blur-sm">
      <div className="flex items-center justify-between px-[clamp(1rem,4vw,2.618rem)] pt-3 pb-3 sm:pt-[1.618rem] sm:pb-4">
        <Link
          href={homeHref}
          className="flex items-center gap-[0.382rem] leading-none opacity-80 transition-opacity hover:opacity-100"
        >
          <LogoMark className="h-[1rem] w-[1rem] shrink-0 text-supervised-ink-1" />
          <span className="text-supervised-xs leading-none font-normal tracking-[0.02em] text-supervised-ink-2 lowercase">
            supervised coach
          </span>
        </Link>

        {/* Desktop: nav links + account + logout samen rechts */}
        <div className="hidden sm:flex items-center gap-[1rem]">
          {navLinks ? (
            <HeaderNav
              links={navLinks}
              linkClass="py-[0.382rem] text-[0.618rem] leading-none font-normal tracking-[0.02em] lowercase"
            />
          ) : null}
          {user ? (
            <>
              <Link href="/account" className={headerNavLinkClass}>
                account
              </Link>
              <LogoutButton />
            </>
          ) : null}
        </div>

        {/* Mobiel: alleen account + logout (nav zit in de strip hieronder) */}
        {user ? (
          <div className="flex sm:hidden items-center gap-[0.618rem]">
            <Link href="/account" className={headerNavLinkClass}>
              account
            </Link>
            <LogoutButton />
          </div>
        ) : null}
      </div>

      {navLinks ? (
        <nav className="flex sm:hidden border-t border-supervised-rule px-[clamp(1rem,4vw,2.618rem)]">
          <HeaderNav
            links={navLinks}
            linkClass="flex-1 py-3 text-center text-[0.618rem] leading-none tracking-[0.02em] lowercase"
          />
        </nav>
      ) : null}
    </header>
  );
}
