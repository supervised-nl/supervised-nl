"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WorkshopContext } from "@/lib/types";

export function WorkshopContextForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: WorkshopContext;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="existingId" value={defaultValues?.id ?? ""} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="processes">Processen</Label>
        <Textarea id="processes" name="processes" defaultValue={defaultValues?.processes ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="toolsUsed">Gebruikte tools</Label>
        <Textarea
          id="toolsUsed"
          name="toolsUsed"
          defaultValue={defaultValues?.tools_used ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="useCases">Use cases</Label>
        <Textarea id="useCases" name="useCases" defaultValue={defaultValues?.use_cases ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notities</Label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} />
      </div>
      <Button type="submit">{defaultValues ? "Workshopcontext bijwerken" : "Workshopcontext aanmaken"}</Button>
    </form>
  );
}
