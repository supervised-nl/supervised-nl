import type { Challenge } from "@/lib/types";
import { MarkdownAnswer } from "@/components/markdown-answer";
import { eyebrowClass } from "@/lib/ui";

function deadlineLabel(sendAt: string | null): string | null {
  if (!sendAt) return null;
  const deadline = new Date(new Date(sendAt).getTime() + 7 * 24 * 60 * 60 * 1000);
  const msLeft = deadline.getTime() - Date.now();
  if (msLeft <= 0) return null;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  if (daysLeft === 1) return "Nog 1 dag beschikbaar";
  if (daysLeft <= 3) return `Nog ${daysLeft} dagen beschikbaar`;
  return `Beschikbaar t/m ${deadline.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}`;
}

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const deadline = deadlineLabel(challenge.send_at);

  return (
    <div className="flex flex-col gap-3 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-6">
      <div className="flex items-center justify-between gap-2">
        <span className={eyebrowClass}>Week {challenge.week_number}</span>
        {deadline ? (
          <span className="text-supervised-xs text-supervised-accent-text-em">{deadline}</span>
        ) : null}
      </div>
      <h2 className="text-supervised-md font-medium text-supervised-ink-1">{challenge.title}</h2>
      <MarkdownAnswer text={challenge.description} showDisclaimer={false} />
      {challenge.expected_outcome ? (
        <details className="border-t border-supervised-rule pt-3">
          <summary className={`${eyebrowClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
            Verwacht resultaat
          </summary>
          <p className="text-supervised-sm text-supervised-ink-3 mt-2">{challenge.expected_outcome}</p>
        </details>
      ) : null}
      <p className="text-supervised-xs text-supervised-ink-4">
        Met AI opgesteld, gecontroleerd door Supervised.
      </p>
    </div>
  );
}
