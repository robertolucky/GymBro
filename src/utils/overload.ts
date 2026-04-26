import { Log } from '../context/GymContext';

export type OverloadSuggestion = {
  currentWeight: number;
  suggestedWeight: number;
  repsLastSession: number;
  repsPrevSession: number;
  message: string;
};

/**
 * Returns a progressive overload suggestion for a given exercise + user, or null
 * if there isn't enough data or the athlete isn't ready yet.
 *
 * "Ready" = last session reached >= REP_THRESHOLD reps → time to add weight.
 */
export function getOverloadSuggestion(
  exerciseId: string,
  userId: string,
  logs: Log[],
  units: 'kg' | 'lbs'
): OverloadSuggestion | null {
  const REP_THRESHOLD = 12;
  const increment = units === 'kg' ? 2.5 : 5;

  // All logs for this exercise + user
  const relevant = logs.filter(
    (l) => l.exerciseId === exerciseId && l.userId === userId
  );
  if (relevant.length === 0) return null;

  // Group into sessions by calendar date, newest first
  const byDate = new Map<string, Log[]>();
  relevant.forEach((l) => {
    const d = l.date.split('T')[0];
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(l);
  });

  const sessions = Array.from(byDate.entries())
    .sort((a, b) => b[0].localeCompare(a[0])); // newest first

  if (sessions.length === 0) return null;

  // Best set in last session = highest weight, then highest reps at that weight
  const best = (sessionLogs: Log[]) => {
    const maxWeight = Math.max(...sessionLogs.map((l) => l.weight));
    const atMax = sessionLogs.filter((l) => l.weight === maxWeight);
    const maxReps = Math.max(...atMax.map((l) => l.reps));
    return { weight: maxWeight, reps: maxReps };
  };

  const last = best(sessions[0][1]);

  if (last.reps >= REP_THRESHOLD) {
    const suggested = Math.round((last.weight + increment) * 10) / 10;
    const prev = sessions.length > 1 ? best(sessions[1][1]) : null;
    return {
      currentWeight: last.weight,
      suggestedWeight: suggested,
      repsLastSession: last.reps,
      repsPrevSession: prev?.reps ?? last.reps,
      message: `${last.reps} reps at ${last.weight}${units} — try ${suggested}${units}`,
    };
  }

  return null;
}
