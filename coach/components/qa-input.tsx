"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function QaInput({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="question">Jouw vraag</Label>
        <Textarea id="question" name="question" required />
      </div>
      <Button type="submit">Vraag stellen</Button>
    </form>
  );
}
