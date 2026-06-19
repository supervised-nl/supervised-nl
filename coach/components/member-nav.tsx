"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageCircle, Trophy, TrendingUp, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type MemberNavRole = Exclude<UserRole, "super_admin">;

const ADMIN_LINK = {
  href: "/dashboard/admin",
  label: "Overzicht",
  icon: LayoutDashboard,
  exact: false,
};

const MEMBER_LINKS = [
  { href: "/dashboard/member", label: "Uitdaging", icon: Zap, exact: true },
  { href: "/dashboard/member/history", label: "Voortgang", icon: TrendingUp, exact: false },
  { href: "/dashboard/leaderboard", label: "Ranglijst", icon: Trophy, exact: false },
  { href: "/dashboard/member/qa", label: "Vraagbaak", icon: MessageCircle, exact: false },
];

const tabBase =
  "border-b-2 px-4 py-3 -mb-px text-supervised-sm transition-colors whitespace-nowrap";
const tabActive = cn(tabBase, "border-supervised-accent text-supervised-ink-1 font-medium");
const tabInactive = cn(tabBase, "border-transparent text-supervised-ink-3 hover:text-supervised-ink-2");

export function MemberNav({ role }: { role: MemberNavRole }) {
  const pathname = usePathname();
  const links = role === "admin" ? [ADMIN_LINK, ...MEMBER_LINKS] : MEMBER_LINKS;

  function active(link: { href: string; exact?: boolean }) {
    return link.exact ? pathname === link.href : pathname.startsWith(link.href);
  }

  return (
    <>
      {/* Desktop: horizontale tab strip */}
      <nav className="hidden sm:flex border-b border-supervised-rule">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={active(link) ? tabActive : tabInactive}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobiel: vaste bottom navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 z-20 flex sm:hidden border-t border-supervised-rule bg-[rgba(2,22,2,0.96)] backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {links.map((link) => {
          const isActive = active(link);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 transition-colors",
                isActive ? "text-supervised-accent" : "text-supervised-ink-3 hover:text-supervised-ink-2",
              )}
            >
              <Icon className="size-[1.1rem] shrink-0" />
              <span className="text-supervised-xs leading-none">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
