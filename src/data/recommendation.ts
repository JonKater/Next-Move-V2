import { Action, DailyContext, ScoreExplanation } from '../types';

/**
 * Deterministic scoring policy matching NextMoveRepository.kt and RecommendationPolicyTest.kt
 */
export function scoreAction(action: Action, context: DailyContext): (Action & { explanation: ScoreExplanation }) | null {
  if (action.estimatedDurationMins <= 0) return null;
  if (action.energyDemand < 1 || action.energyDemand > 3 || context.energyLevel < 1 || context.energyLevel > 3) return null;
  if (action.deferredDateMs != null && action.deferredDateMs === context.dateMs) return null;
  if (action.context !== 'Anywhere' && action.context !== context.availableContext) return null;

  const durationFit = action.estimatedDurationMins <= context.usableTimeMins;
  const durationScore = durationFit ? 5 : -10;

  const energyFit = action.energyDemand <= context.energyLevel;
  const energyScore = energyFit ? 5 : -5;

  const clampedUrgency = Math.min(3, Math.max(1, action.urgency));
  const urgencyScore = clampedUrgency * 2;

  const clampedRelevance = Math.min(3, Math.max(1, action.strategicRelevance ?? 2));
  const strategicScore = clampedRelevance * 1.5;

  const totalScore = durationScore + energyScore + urgencyScore + strategicScore;

  const explanation: ScoreExplanation = {
    durationScore,
    durationFit,
    energyScore,
    energyFit,
    urgencyScore,
    strategicScore,
    totalScore,
  };

  return {
    ...action,
    score: totalScore,
    explanation,
  };
}

/**
 * Filter active projects and ready / daily_win actions, score them, and sort descending by score then ascending by ID
 */
export function getScoredActions(
  actions: Action[],
  activeProjectIds: Set<number>,
  context: DailyContext | null
): (Action & { explanation: ScoreExplanation })[] {
  if (!context) return [];

  const eligibleActions = actions.filter((a) => {
    const isProjectActive = activeProjectIds.has(a.projectId);
    const isStatusReady = a.status === 'ready' || a.status === 'daily_win';
    return isProjectActive && isStatusReady;
  });

  const scored = eligibleActions
    .map((action) => scoreAction(action, context))
    .filter((a): a is Action & { explanation: ScoreExplanation } => a !== null);

  // Sorted with compareByDescending<Action> { it.score }.thenBy { it.id }
  return scored.sort((a, b) => {
    if (b.score !== a.score) {
      return (b.score ?? 0) - (a.score ?? 0);
    }
    return a.id - b.id;
  });
}

/**
 * Returns top recommendation: daily_win if present, otherwise top scored
 */
export function getTopRecommendation(scoredActions: (Action & { explanation: ScoreExplanation })[]): (Action & { explanation: ScoreExplanation }) | null {
  return scoredActions.find((a) => a.status === 'daily_win') ?? scoredActions[0] ?? null;
}
