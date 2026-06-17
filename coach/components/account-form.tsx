"use client";

import { useActionState } from "react";

import { updateAccount, type AccountState } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AccountState = { error: null, success: null };

export function AccountForm({ defaultName }: { defaultName: string | null }) {
  const [state, formAction, pending] = useActionState(updateAccount, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Naam</Label>
        <Input id="name" name="name" defaultValue={defaultName ?? ""} autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nieuw wachtwoord</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="passwordConfirm">Bevestig nieuw wachtwoord</Label>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" />
      </div>
      {state.error ? <p className="text-supervised-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-supervised-sm text-supervised-ink-3">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Bezig met opslaan…" : "Opslaan"}
      </Button>
    </form>
  );
}
