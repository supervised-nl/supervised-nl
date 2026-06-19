"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type State = { error: string | null; sent: boolean };
const init: State = { error: null, sent: false };

export function InviteUserForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      try {
        await action(formData);
        return { error: null, sent: true };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Er ging iets mis.", sent: false };
      }
    },
    init,
  );

  if (state.sent) {
    return (
      <p className="text-supervised-sm text-supervised-ink-2">
        Uitnodiging verstuurd. Ze ontvangen een e-mail met een link om in te loggen.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-name">Naam</Label>
        <Input id="invite-name" name="name" required placeholder="Volledige naam" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-email">E-mailadres</Label>
        <Input id="invite-email" name="email" type="email" required placeholder="naam@bedrijf.nl" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-role">Rol</Label>
        <Select name="role" defaultValue="member">
          <SelectTrigger id="invite-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Medewerker</SelectItem>
            <SelectItem value="admin">Beheerder</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state.error ? (
        <p className="text-supervised-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Sturen…" : "Uitnodiging sturen"}
      </Button>
    </form>
  );
}
