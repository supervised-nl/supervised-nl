"use client";

import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Challenge } from "@/lib/types";
import { eyebrowClass, statusBadgeClass } from "@/lib/ui";

const STATUS_LABELS: Record<Challenge["status"], string> = {
  draft: "Concept",
  active: "Actief",
  completed: "Afgerond",
};

export function ChallengeEditor({
  challenge,
  updateAction,
  activateAction,
}: {
  challenge: Challenge;
  updateAction: (formData: FormData) => void;
  activateAction: (formData: FormData) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-6">
      <div className="flex items-center justify-between">
        <span className={eyebrowClass}>Week {challenge.week_number}</span>
        <span className={statusBadgeClass}>{STATUS_LABELS[challenge.status]}</span>
      </div>

      {challenge.status === "draft" ? (
        <>
          <form action={updateAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`title-${challenge.id}`}>Titel</Label>
              <Input
                id={`title-${challenge.id}`}
                name="title"
                required
                defaultValue={challenge.title}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`description-${challenge.id}`}>Beschrijving</Label>
              <Textarea
                id={`description-${challenge.id}`}
                name="description"
                required
                defaultValue={challenge.description}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`expectedOutcome-${challenge.id}`}>Verwacht resultaat</Label>
              <Textarea
                id={`expectedOutcome-${challenge.id}`}
                name="expectedOutcome"
                defaultValue={challenge.expected_outcome ?? ""}
              />
            </div>
            <Button type="submit" variant="outline">
              Opslaan
            </Button>
          </form>
          <form action={activateAction}>
            <ConfirmButton
              type="submit"
              confirmMessage="Wil je deze uitdaging activeren en naar je team sturen?"
            >
              Activeren
            </ConfirmButton>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-supervised-ink-1">{challenge.title}</h3>
          <p className="text-supervised-sm text-supervised-ink-3">{challenge.description}</p>
          {challenge.expected_outcome ? (
            <p className="text-supervised-sm text-supervised-ink-4">
              Verwacht resultaat: {challenge.expected_outcome}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
