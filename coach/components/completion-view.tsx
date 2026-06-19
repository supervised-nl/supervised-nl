"use client";

import { useState } from "react";

import { CompletionForm } from "@/components/completion-form";
import { Button } from "@/components/ui/button";
import { eyebrowClass } from "@/lib/ui";


interface Props {
  completion: {
    id: string;
    time_saved_minutes: number | null;
    shared_prompt: string | null;
    shared_result: string | null;
  };
  updateAction: (formData: FormData) => Promise<void>;
}

export function CompletionView({ completion, updateAction }: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(formData: FormData) {
    setError(null);
    try {
      await updateAction(formData);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opslaan mislukt.");
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3">
        <CompletionForm
          action={handleSave}
          defaultValues={{
            timeSavedMinutes: completion.time_saved_minutes,
            sharedPrompt: completion.shared_prompt,
            sharedResult: completion.shared_result,
          }}
        />
        {error ? <p className="text-supervised-sm text-destructive">{error}</p> : null}
        <Button variant="outline" type="button" onClick={() => setEditing(false)}>
          Annuleren
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-6">
      <div className="flex items-center justify-between">
        <span className={eyebrowClass}>Uitdaging afgerond</span>
        <Button variant="outline" size="sm" type="button" onClick={() => setEditing(true)}>
          Wijzigen
        </Button>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={eyebrowClass}>Tijdsbesparing</span>
        <p className="font-medium text-supervised-ink-1">
          {completion.time_saved_minutes !== null
            ? `${completion.time_saved_minutes} minuten`
            : "Niet ingevuld"}
        </p>
      </div>
      {completion.shared_prompt ? (
        <div className="flex flex-col gap-0.5">
          <span className={eyebrowClass}>Prompt</span>
          <p className="text-supervised-sm text-supervised-ink-3 line-clamp-4">
            {completion.shared_prompt}
          </p>
        </div>
      ) : null}
      {completion.shared_result ? (
        <div className="flex flex-col gap-0.5">
          <span className={eyebrowClass}>Resultaat</span>
          <p className="text-supervised-sm text-supervised-ink-3 line-clamp-4">
            {completion.shared_result}
          </p>
        </div>
      ) : null}
    </div>
  );
}
