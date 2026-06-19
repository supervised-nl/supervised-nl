"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

type State = { error: string | null };
const init: State = { error: null };

export function GenerateChallengeButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(
    async (): Promise<State> => {
      try {
        await action();
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Genereren mislukt." };
      }
    },
    init,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      {state.error ? (
        <p className="text-supervised-sm text-destructive">{state.error}</p>
      ) : null}
      <form action={formAction}>
        <Button type="submit" disabled={pending}>
          {pending ? "Genereren…" : "Genereer uitdaging"}
        </Button>
      </form>
    </div>
  );
}
