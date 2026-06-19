"use client";

import { useActionState } from "react";

import { resetPassword, type ResetPasswordState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ResetPasswordState = { error: null };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nieuw wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Herhaal wachtwoord</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {state.error ? (
        <p className="text-supervised-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Bezig met opslaan…" : "Wachtwoord opslaan"}
      </Button>
    </form>
  );
}
