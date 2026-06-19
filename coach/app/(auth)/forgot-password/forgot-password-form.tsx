"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset, type ForgotPasswordState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ForgotPasswordState = { error: null, sent: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.sent) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-supervised-sm text-supervised-ink-1">
          Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een link om je wachtwoord te resetten.
        </p>
        <Link href="/login" className="text-supervised-sm text-supervised-ink-3 transition-colors hover:text-supervised-ink-2">
          ← Terug naar inloggen
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state.error ? (
        <p className="text-supervised-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Bezig met versturen…" : "Resetlink versturen"}
      </Button>
      <Link href="/login" className="text-center text-supervised-sm text-supervised-ink-3 transition-colors hover:text-supervised-ink-2">
        Terug naar inloggen
      </Link>
    </form>
  );
}
