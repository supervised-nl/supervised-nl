"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-supervised-lg font-light text-supervised-ink-1">Er is iets misgegaan</h1>
      <p className="text-supervised-sm text-supervised-ink-3">{error.message || "Probeer de pagina te verversen."}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Probeer opnieuw
        </Button>
        <Link href="/dashboard/admin" className={buttonVariants({ variant: "outline" })}>
          Naar dashboard
        </Link>
      </div>
    </main>
  );
}
