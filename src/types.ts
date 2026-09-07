export type ActionStatus = 'ready' | 'completed' | 'rejected' | 'parked' | 'daily_win' | 'split';
export type ActionContext = 'Anywhere' | 'Computer' | 'Phone' | 'Errands';

export interface Goal {
  id: number;
  name: string;
  color: string;
}

export interface Project {
  id: number;
  goalId: number;
  name: string;
  status: 'active' | 'archived' | 'completed';
}

export interface DelegationRecommendation {
  isDelegable: boolean;
  recommendedHarness: string;
  recommendedModel: string;
  configuration: string;
  prompt: string;
  rationale: string;
}

export interface Action {
  id: number;
  projectId: number;
  milestone?: string;
  name: string;
  estimatedDurationMins: number;
  energyDemand: number; // 1 (low) to 3 (high)
  urgency: number; // 1 (low) to 3 (high)
  context: ActionContext | string;
  strategicRelevance: number; // 1 to 3
  status: ActionStatus;
  score?: number;
  deferredDateMs?: number | null;
  delegation?: DelegationRecommendation;
}

export interface Harness {
  id: string;
  name: string;
  description: string;
  capabilities: string;
}

export interface PersonalData {
  id: string;
  key: string;
  value: string;
  description: string;
}

export interface DailyContext {
  id: number;
  dateMs: number;
  usableTimeMins: number;
  energyLevel: number; // 1 (Low) to 3 (High)
  hasCommitments: boolean;
  dailyWinActionId: number | null;
  availableContext: ActionContext | string;
}

export interface DecisionLog {
  id: number;
  actionId: number;
  decision: 'completed' | 'too_big' | 'wrong_context' | 'not_now';
  timestamp: number;
}

export interface EveningReview {
  id: number;
  dateMs: number;
  completedText: string;
  blockedText: string;
  timestamp: number;
}

export interface ParkedThought {
  id: number;
  actionId: number;
  actionName: string;
  thought: string;
  timestamp: number;
}

export interface ScoreExplanation {
  durationScore: number;
  durationFit: boolean;
  energyScore: number;
  energyFit: boolean;
  urgencyScore: number;
  strategicScore: number;
  totalScore: number;
}
