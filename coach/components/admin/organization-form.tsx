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
import type { Organization, OrganizationSize } from "@/lib/types";

const SIZE_OPTIONS: OrganizationSize[] = ["1-5", "5-15", "15-50", "50+"];

export function OrganizationForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Pick<Organization, "name" | "sector" | "size">;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Naam</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sector">Sector</Label>
        <Input id="sector" name="sector" defaultValue={defaultValues?.sector ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="size">Aantal medewerkers</Label>
        <Select name="size" defaultValue={defaultValues?.size ?? undefined}>
          <SelectTrigger id="size" className="w-full">
            <SelectValue placeholder="Kies een grootte" />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
