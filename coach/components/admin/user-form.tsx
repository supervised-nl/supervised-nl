"use client";

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
import type { Organization, User } from "@/lib/types";

export function UserForm({
  action,
  organizations,
  defaultOrganizationId,
  mode = "create",
  defaultValues,
}: {
  action: (formData: FormData) => void;
  organizations: Pick<Organization, "id" | "name">[];
  defaultOrganizationId?: string;
  mode?: "create" | "edit";
  defaultValues?: Pick<User, "name" | "email" | "role" | "organization_id">;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Naam</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name ?? undefined} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultValues?.email ?? undefined}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">
          {mode === "edit" ? "Nieuw wachtwoord (optioneel, laat leeg om te behouden)" : "Wachtwoord"}
        </Label>
        <Input id="password" name="password" type="password" required={mode === "create"} minLength={8} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">Rol</Label>
        <Select name="role" defaultValue={defaultValues?.role ?? "member"}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue placeholder="Kies een rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin (bedrijfseigenaar)</SelectItem>
            <SelectItem value="member">Member (medewerker)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organizationId">Organisatie</Label>
        <Select
          name="organizationId"
          defaultValue={defaultValues?.organization_id ?? defaultOrganizationId ?? undefined}
        >
          <SelectTrigger id="organizationId" className="w-full">
            <SelectValue placeholder="Kies een organisatie" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">{mode === "edit" ? "Wijzigingen opslaan" : "Gebruiker aanmaken"}</Button>
    </form>
  );
}
