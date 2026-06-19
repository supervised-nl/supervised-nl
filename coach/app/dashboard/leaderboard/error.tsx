"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LeaderboardError({
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
      <h1 className="text-supervised-lg font-light text-supervised-ink-1">Ranglijst niet beschikbaar</h1>
      <p className="text-supervised-sm text-supervised-ink-3">{error.message || "Probeer de pagina te verversen."}</p>
      <Button variant="outline" onClick={reset}>
        Probeer opnieuw
      </Button>
    </main>
  );
}
