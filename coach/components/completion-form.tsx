"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompletionFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    timeSavedMinutes?: number | null;
    sharedPrompt?: string | null;
    sharedResult?: string | null;
  };
}

export function CompletionForm({ action, defaultValues }: CompletionFormProps) {
  const isEdit = defaultValues !== undefined;
  const hasOptionalValues = defaultValues?.sharedPrompt || defaultValues?.sharedResult;

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-4">
        <Label htmlFor="timeSavedMinutes">Hoeveel minuten bespaarde je?</Label>
        <p className="text-supervised-xs text-supervised-ink-3 -mt-1 mb-1">
          Vergelijk met hoe je dit vroeger aanpakte, zonder AI. Vul 0 in als je geen verschil merkte.
        </p>
        <Input
          id="timeSavedMinutes"
          name="timeSavedMinutes"
          type="number"
          min={0}
          required
          placeholder="bijv. 15"
          defaultValue={defaultValues?.timeSavedMinutes ?? undefined}
        />
      </div>
      <details className="w-full min-w-0 rounded-supervised-md border border-supervised-rule p-4" open={hasOptionalValues ? true : undefined}>
        <summary className="cursor-pointer text-supervised-sm font-medium text-supervised-ink-2">
          Prompt en resultaat delen (optioneel)
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sharedPrompt">Gedeelde prompt</Label>
            <Textarea id="sharedPrompt" name="sharedPrompt" defaultValue={defaultValues?.sharedPrompt ?? undefined} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sharedResult">Gedeeld resultaat</Label>
            <Textarea id="sharedResult" name="sharedResult" defaultValue={defaultValues?.sharedResult ?? undefined} />
          </div>
        </div>
      </details>
      <Button type="submit">{isEdit ? "Wijzigingen opslaan" : "Ik heb dit gedaan"}</Button>
    </form>
  );
}
