"use client";

import { useState, useTransition } from "react";
import { getChallengeHint } from "@/actions/hint";

export function HintButton({ challengeId }: { challengeId: string }) {
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await getChallengeHint(challengeId);
        setHint(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tip ophalen mislukt.");
      }
    });
  }

  if (hint) {
    return (
      <div className="rounded-supervised-md border border-supervised-rule bg-supervised-surface px-4 py-3 flex flex-col gap-1">
        <span className="text-supervised-xs uppercase tracking-[0.382em] text-supervised-ink-3">Tip</span>
        <p className="text-supervised-sm text-supervised-ink-2">{hint}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="self-start text-supervised-sm text-supervised-ink-3 hover:text-supervised-ink-2 transition-colors disabled:opacity-50"
      >
        {isPending ? "Tip ophalen…" : "Zit je vast? Vraag een tip →"}
      </button>
      {error ? <p className="text-supervised-xs text-destructive">{error}</p> : null}
    </div>
  );
}
