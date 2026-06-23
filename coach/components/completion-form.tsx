"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const REFLECTION_MAX = 280;

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Wordt opgeslagen…" : isEdit ? "Wijzigingen opslaan" : "Ik heb dit gedaan"}
    </Button>
  );
}

interface CompletionFormProps {
  action: (formData: FormData) => Promise<void>;
  reflectionPrompt?: string;
  defaultValues?: {
    timeSavedMinutes?: number | null;
    sharedPrompt?: string | null;
    sharedResult?: string | null;
    reflection?: string | null;
  };
}

export function CompletionForm({ action, reflectionPrompt, defaultValues }: CompletionFormProps) {
  const isEdit = defaultValues !== undefined;
  const [showOptional, setShowOptional] = useState(
    !!(defaultValues?.sharedPrompt || defaultValues?.sharedResult || defaultValues?.reflection),
  );
  const [reflectionLength, setReflectionLength] = useState(
    defaultValues?.reflection?.length ?? 0,
  );

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

      <div className="rounded-supervised-md border border-supervised-rule overflow-hidden">
        <button
          type="button"
          aria-expanded={showOptional}
          onClick={() => setShowOptional((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-supervised-sm font-medium text-supervised-ink-2 transition-colors hover:text-supervised-ink-1"
        >
          <span>
            Prompt, resultaat en reflectie{" "}
            <span className="font-normal text-supervised-ink-4">(optioneel)</span>
          </span>
          <span className="text-supervised-ink-4 text-base leading-none select-none">
            {showOptional ? "−" : "+"}
          </span>
        </button>

        {showOptional ? (
          <div className="border-t border-supervised-rule px-4 pt-4 pb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sharedPrompt">Prompt</Label>
              <Textarea
                id="sharedPrompt"
                name="sharedPrompt"
                defaultValue={defaultValues?.sharedPrompt ?? undefined}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sharedResult">Resultaat</Label>
              <Textarea
                id="sharedResult"
                name="sharedResult"
                defaultValue={defaultValues?.sharedResult ?? undefined}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="reflection">{reflectionPrompt ?? "Wat leerde je?"}</Label>
                <span className={`text-supervised-xs tabular-nums ${reflectionLength > REFLECTION_MAX - 20 ? "text-destructive" : "text-supervised-ink-4"}`}>
                  {reflectionLength}/{REFLECTION_MAX}
                </span>
              </div>
              <p className="text-supervised-xs text-supervised-ink-3 -mt-1">
                Persoonlijke noot voor jezelf, zichtbaar in je voortgang.
              </p>
              <Textarea
                id="reflection"
                name="reflection"
                maxLength={REFLECTION_MAX}
                defaultValue={defaultValues?.reflection ?? undefined}
                onChange={(e) => setReflectionLength(e.target.value.length)}
              />
            </div>
          </div>
        ) : (
          <>
            {defaultValues?.sharedPrompt != null ? (
              <input type="hidden" name="sharedPrompt" value={defaultValues.sharedPrompt} />
            ) : null}
            {defaultValues?.sharedResult != null ? (
              <input type="hidden" name="sharedResult" value={defaultValues.sharedResult} />
            ) : null}
            {defaultValues?.reflection != null ? (
              <input type="hidden" name="reflection" value={defaultValues.reflection} />
            ) : null}
          </>
        )}
      </div>

      <SubmitButton isEdit={isEdit} />
    </form>
  );
}
