"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/nav";

export function HeaderNav({ links, linkClass }: { links: NavLink[]; linkClass?: string }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              linkClass,
              "transition-colors",
              isActive
                ? "text-supervised-ink-1"
                : "text-supervised-ink-3 hover:text-supervised-ink-2",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
