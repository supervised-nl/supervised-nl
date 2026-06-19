import type { Challenge } from "@/lib/types";
import { eyebrowClass } from "@/lib/ui";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="flex flex-col gap-3 rounded-supervised-md border border-supervised-rule bg-supervised-surface p-6">
      <span className={eyebrowClass}>Week {challenge.week_number}</span>
      <h2 className="text-supervised-md font-medium text-supervised-ink-1">{challenge.title}</h2>
      <p className="text-supervised-ink-2">{challenge.description}</p>
      {challenge.expected_outcome ? (
        <div className="flex flex-col gap-1 border-t border-supervised-rule pt-3">
          <span className={eyebrowClass}>Verwacht resultaat</span>
          <p className="text-supervised-sm text-supervised-ink-3">{challenge.expected_outcome}</p>
        </div>
      ) : null}
      <p className="text-supervised-xs text-supervised-ink-4">
        Met AI opgesteld, gecontroleerd door Supervised.
      </p>
    </div>
  );
}
