import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const REFLECTION_PROMPTS = [
  "Wat zou je de volgende keer anders aanpakken?",
  "Welke stap kostte het meeste tijd?",
  "Wat was verrassend aan het werken met AI?",
  "Hoe zou je dit toepassen in je dagelijkse werk?",
  "Wat leerde je over het formuleren van een goede prompt?",
  "Waar liep je tegenaan, en hoe loste je dat op?",
  "Wat zou je een collega als eerste tip geven?",
];

export function getReflectionPrompt(weekNumber: number): string {
  return REFLECTION_PROMPTS[weekNumber % REFLECTION_PROMPTS.length];
}

export function calculateStreak(
  completions: Array<{ challenge_id: string }>,
  challenges: Array<{ id: string; week_number: number }>,
): number {
  const weekByChallenge = new Map(challenges.map((c) => [c.id, c.week_number]));
  const completedWeeks = new Set(
    completions.map((c) => weekByChallenge.get(c.challenge_id)).filter((w): w is number => w !== undefined),
  );
  if (completedWeeks.size === 0) return 0;
  const maxWeek = Math.max(...completedWeeks);
  let streak = 0;
  for (let w = maxWeek; w >= 1; w--) {
    if (completedWeeks.has(w)) streak++;
    else break;
  }
  return streak;
}
