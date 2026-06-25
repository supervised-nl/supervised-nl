import Link from "next/link";

import { HeaderNav } from "@/components/header-nav";
import { LogoMark } from "@/components/logo-mark";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUser } from "@/lib/auth";
import { getMemberNavLinks } from "@/lib/nav";
import { roleHome } from "@/lib/role-home";
import { headerNavLinkClass } from "@/lib/ui";

export async function AppHeader() {
  const user = await getUser();
  const homeHref = user ? roleHome(user.role) : "/";
  const navLinks = user ? getMemberNavLinks(user.role) : undefined;

  return (
    <header className="fixed inset-x-0 top-0 z-10 border-b border-supervised-rule backdrop-blur-sm" style={{ background: "var(--bg-header)" }}>
      <div className="flex items-center justify-between px-[clamp(1rem,4vw,2.618rem)] pt-3 pb-3 sm:pt-[1.618rem] sm:pb-4">
        <Link
          href={homeHref}
          className="flex items-center gap-[0.382rem] leading-none opacity-80 transition-opacity hover:opacity-100"
        >
          <LogoMark className="h-[1.4rem] w-[1.4rem] shrink-0 translate-y-[0.05rem] text-supervised-ink-1" />
          <span className="text-[0.764rem] leading-none font-normal tracking-[0.02em] text-supervised-ink-2 lowercase">
            supervised coach
          </span>
        </Link>

        {/* Desktop: nav links + account + logout + toggle samen rechts */}
        <div className="hidden sm:flex items-center gap-[1rem]">
          {navLinks ? (
            <HeaderNav
              links={navLinks}
              linkClass="py-[0.382rem] text-[0.764rem] leading-none font-normal tracking-[0.02em] lowercase"
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
          <ThemeToggle />
        </div>

        {/* Mobiel: account + logout + toggle */}
        <div className="flex sm:hidden items-center gap-[0.618rem]">
          {user ? (
            <>
              <Link href="/account" className={headerNavLinkClass}>
                account
              </Link>
              <LogoutButton />
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </div>

      {navLinks ? (
        <nav className="flex sm:hidden border-t border-supervised-rule px-[clamp(1rem,4vw,2.618rem)]">
          <HeaderNav
            links={navLinks}
            linkClass="flex-1 py-3 text-center text-[0.764rem] leading-none tracking-[0.02em] lowercase"
          />
        </nav>
      ) : null}
    </header>
  );
}
