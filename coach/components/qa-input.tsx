"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 500;

type State = { error: string | null };
const initialState: State = { error: null };

export function QaInput({ action }: { action: (formData: FormData) => Promise<void> }) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      try {
        await action(formData);
        formRef.current?.reset();
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Er ging iets mis. Probeer het opnieuw." };
      }
    },
    initialState,
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="question">Jouw vraag</Label>
        <Textarea
          id="question"
          name="question"
          required
          maxLength={MAX_LENGTH}
          placeholder="Bijv. hoe gebruik ik AI om een offerte sneller op te stellen?"
        />
        <p className="text-supervised-xs text-supervised-ink-4">Maximaal {MAX_LENGTH} tekens.</p>
      </div>
      {state.error ? (
        <p className="text-supervised-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Bezig…" : "Vraag stellen"}
      </Button>
    </form>
  );
}
