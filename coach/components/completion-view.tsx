"use client";

import { useState } from "react";

import { markAsTeamPrompt } from "@/actions/completion";
import { CompletionForm } from "@/components/completion-form";
import { Button } from "@/components/ui/button";
import { eyebrowClass } from "@/lib/ui";

interface Props {
  completion: {
    id: string;
    time_saved_minutes: number | null;
    shared_prompt: string | null;
    shared_result: string | null;
    reflection: string | null;
    is_team_prompt: boolean;
  };
  updateAction: (formData: FormData) => Promise<void>;
  teamDoneCount?: number;
  teamTotalCount?: number;
}

export function CompletionView({ completion, updateAction, teamDoneCount, teamTotalCount }: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTeamPrompt, setIsTeamPrompt] = useState(completion.is_team_prompt);
  const [teamPromptPending, setTeamPromptPending] = useState(false);

  const hasShared = !!(completion.shared_prompt || completion.shared_result);

  async function handleSave(formData: FormData) {
    setError(null);
    try {
      await updateAction(formData);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opslaan mislukt.");
    }
  }

  async function handleTeamPromptToggle() {
    setTeamPromptPending(true);
    try {
      await markAsTeamPrompt(completion.id, !isTeamPrompt);
      setIsTeamPrompt((v) => !v);
    } catch {
      // silently ignore, state stays unchanged
    } finally {
      setTeamPromptPending(false);
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
            reflection: completion.reflection,
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-supervised-md border border-supervised-accent-soft bg-supervised-accent-bg p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className={eyebrowClass}>Uitdaging afgerond</span>
            {completion.time_saved_minutes !== null && completion.time_saved_minutes > 0 ? (
              <p className="text-supervised-md font-light text-supervised-ink-1">
                Je bespaarde{" "}
                <span className="text-supervised-accent">{completion.time_saved_minutes} minuten</span>.
              </p>
            ) : (
              <p className="text-supervised-md font-light text-supervised-ink-1">Goed gedaan.</p>
            )}
            {teamDoneCount !== undefined && teamTotalCount !== undefined && teamTotalCount > 0 ? (
              <p className="text-supervised-sm text-supervised-ink-3">
                {teamDoneCount} van {teamTotalCount} teamleden klaar deze week.
              </p>
            ) : null}
          </div>
          <Button variant="outline" size="sm" type="button" onClick={() => setEditing(true)} className="shrink-0">
            Wijzigen
          </Button>
        </div>

        {completion.shared_prompt ? (
          <div className="flex flex-col gap-0.5 border-t border-supervised-rule pt-3">
            <span className={eyebrowClass}>Prompt</span>
            <p className="text-supervised-sm text-supervised-ink-3 line-clamp-4">
              {completion.shared_prompt}
            </p>
          </div>
        ) : null}
        {completion.shared_result ? (
          <div className="flex flex-col gap-0.5 border-t border-supervised-rule pt-3">
            <span className={eyebrowClass}>Resultaat</span>
            <p className="text-supervised-sm text-supervised-ink-3 line-clamp-4">
              {completion.shared_result}
            </p>
          </div>
        ) : null}
        {completion.reflection ? (
          <div className="flex flex-col gap-0.5 border-t border-supervised-rule pt-3">
            <span className={eyebrowClass}>Wat je leerde</span>
            <p className="text-supervised-sm text-supervised-ink-3">{completion.reflection}</p>
          </div>
        ) : null}

        {hasShared ? (
          <div className="border-t border-supervised-rule pt-3">
            <button
              type="button"
              onClick={handleTeamPromptToggle}
              disabled={teamPromptPending}
              className="text-supervised-xs text-supervised-ink-3 hover:text-supervised-ink-1 transition-colors disabled:opacity-50"
            >
              {isTeamPrompt ? "Teamprompt ✓ (verwijder)" : "Sla op als teamprompt"}
            </button>
          </div>
        ) : null}
      </div>

      <p className="text-supervised-xs text-supervised-ink-4">
        Werkt jouw netwerk ook met AI?{" "}
        <a
          href="https://supervised.nl"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-supervised-ink-3 transition-colors"
        >
          Supervised geeft AI-workshops aan MKB-teams.
        </a>
      </p>
    </div>
  );
}
