import { Action, DailyContext, DecisionLog, EveningReview, Goal, ParkedThought, Project, Harness, PersonalData } from '../types';

const STORAGE_KEY = 'next_move_db_v1';

export interface NextMoveState {
  goals: Goal[];
  projects: Project[];
  actions: Action[];
  dailyContexts: DailyContext[];
  decisionLogs: DecisionLog[];
  eveningReviews: EveningReview[];
  parkedThoughts: ParkedThought[];
  harnesses: Harness[];
  personalData: PersonalData[];
  nextId: number;
}

export function getTodayStartMs(offsetDays: number = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const DEFAULT_STATE: NextMoveState = {
  goals: [
    { id: 1, name: 'Ship Next Move App', color: '#6750A4' },
    { id: 2, name: 'Daily Habits', color: '#0284C7' },
  ],
  projects: [
    { id: 1, goalId: 1, name: 'V1 Execution Coach', status: 'active' },
    { id: 2, goalId: 2, name: 'Inbox', status: 'active' },
  ],
  actions: [
    {
      id: 1,
      projectId: 1,
      name: 'Setup Room Database & Local Cache',
      estimatedDurationMins: 30,
      energyDemand: 2,
      urgency: 3,
      context: 'Computer',
      strategicRelevance: 3,
      status: 'ready',
      deferredDateMs: null,
    },
    {
      id: 2,
      projectId: 1,
      name: 'Design Home Screen & Recommendation Card',
      estimatedDurationMins: 45,
      energyDemand: 3,
      urgency: 2,
      context: 'Computer',
      strategicRelevance: 2,
      status: 'ready',
      deferredDateMs: null,
    },
    {
      id: 3,
      projectId: 1,
      name: 'Write App Icon Generation Prompt',
      estimatedDurationMins: 10,
      energyDemand: 1,
      urgency: 1,
      context: 'Computer',
      strategicRelevance: 1,
      status: 'ready',
      deferredDateMs: null,
    },
    {
      id: 4,
      projectId: 2,
      name: 'Review weekly bank statements',
      estimatedDurationMins: 20,
      energyDemand: 1,
      urgency: 2,
      context: 'Phone',
      strategicRelevance: 2,
      status: 'ready',
      deferredDateMs: null,
    },
    {
      id: 5,
      projectId: 2,
      name: 'Pick up parcel from post locker',
      estimatedDurationMins: 25,
      energyDemand: 2,
      urgency: 3,
      context: 'Errands',
      strategicRelevance: 1,
      status: 'ready',
      deferredDateMs: null,
    },
  ],
  dailyContexts: [],
  decisionLogs: [],
  eveningReviews: [],
  parkedThoughts: [],
  harnesses: [
    { id: 'h1', name: 'Claude', description: 'Anthropic Claude models', capabilities: 'Models: Haiku, Opus. Requires effort level.' },
    { id: 'h2', name: 'ChatGPT', description: 'OpenAI ChatGPT models', capabilities: 'Requires reasoning level.' },
    { id: 'h3', name: 'Gemini', description: 'Google Gemini product portfolio', capabilities: 'General purpose.' },
    { id: 'h4', name: 'Hermes 1', description: 'Custom agent Hermes 1', capabilities: 'Operates on IONOS server, domain 11john.com. Requires effort level and reasoning level.' },
    { id: 'h5', name: 'Hermes 2', description: 'Custom agent Hermes 2', capabilities: 'Runs on Laptop, Windows 11. Storage at capacity limit. Use infrequently. Requires effort level and reasoning level.' },
    { id: 'h6', name: 'Hermes 3', description: 'Custom agent Hermes 3', capabilities: 'Operates on Hostinger server, domain 11john.de. Requires effort level and reasoning level.' },
  ],
  personalData: [
    { id: 'pd1', key: 'Date of Birth', value: '1990-05-19', description: 'DOB for official documents' },
    { id: 'pd2', key: 'Jobcenter BG Number', value: 'BG-12345-67890', description: 'BG number to be included in all Jobcenter correspondence' },
    { id: 'pd3', key: 'Reference File 1', value: 'AZ-2026-X88', description: 'Garden lease agreement' },
  ],
  nextId: 10,
};

export class NextMoveDB {
  private static loadState(): NextMoveState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return DEFAULT_STATE;
  }

  private static saveState(state: NextMoveState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  static getState(): NextMoveState {
    return this.loadState();
  }

  static resetToSampleData(): NextMoveState {
    const state = { ...DEFAULT_STATE };
    this.saveState(state);
    return state;
  }

  static getOrCreateInboxProjectId(): number {
    const state = this.loadState();
    let inbox = state.projects.find((p) => p.name.toLowerCase() === 'inbox');
    if (!inbox) {
      const newProjectId = ++state.nextId;
      let inboxGoal = state.goals.find((g) => g.name.toLowerCase() === 'inbox');
      if (!inboxGoal) {
        const newGoalId = ++state.nextId;
        inboxGoal = { id: newGoalId, name: 'Inbox', color: '#625B71' };
        state.goals.push(inboxGoal);
      }
      inbox = { id: newProjectId, goalId: inboxGoal.id, name: 'Inbox', status: 'active' };
      state.projects.push(inbox);
      this.saveState(state);
    }
    return inbox.id;
  }

  static saveDailyContext(usableTimeMins: number, energyLevel: number, availableContext: string, dateMs?: number): DailyContext {
    const state = this.loadState();
    const today = dateMs ?? getTodayStartMs();

    const existingIndex = state.dailyContexts.findIndex((c) => c.dateMs === today);
    const newContext: DailyContext = {
      id: existingIndex >= 0 ? state.dailyContexts[existingIndex].id : ++state.nextId,
      dateMs: today,
      usableTimeMins,
      energyLevel,
      hasCommitments: false,
      dailyWinActionId: null,
      availableContext,
    };

    if (existingIndex >= 0) {
      state.dailyContexts[existingIndex] = newContext;
    } else {
      state.dailyContexts.push(newContext);
    }

    this.saveState(state);
    return newContext;
  }

  static getLatestDailyContext(): DailyContext | null {
    const state = this.loadState();
    if (state.dailyContexts.length === 0) return null;
    return [...state.dailyContexts].sort((a, b) => b.dateMs - a.dateMs)[0] ?? null;
  }

  static recordDecision(actionId: number, decision: 'completed' | 'too_big' | 'wrong_context' | 'not_now', newStatus: Action['status']): NextMoveState {
    const state = this.loadState();
    const action = state.actions.find((a) => a.id === actionId);
    if (action) {
      action.status = newStatus;
      state.decisionLogs.push({
        id: ++state.nextId,
        actionId,
        decision,
        timestamp: Date.now(),
      });
      this.saveState(state);
    }
    return state;
  }

  static deferActionForDate(actionId: number, dateMs: number): NextMoveState {
    const state = this.loadState();
    const action = state.actions.find((a) => a.id === actionId);
    if (action) {
      action.deferredDateMs = dateMs;
      state.decisionLogs.push({
        id: ++state.nextId,
        actionId,
        decision: 'not_now',
        timestamp: Date.now(),
      });
      this.saveState(state);
    }
    return state;
  }

  static splitActionAtomically(actionId: number, part1Name: string, part2Name: string, dur1: number, dur2: number): NextMoveState {
    const state = this.loadState();
    const original = state.actions.find((a) => a.id === actionId);
    if (!original) return state;

    if (!part1Name.trim() || !part2Name.trim() || dur1 <= 0 || dur2 <= 0) {
      throw new Error('Split action requires non-empty names and positive durations.');
    }

    original.status = 'split';
    state.decisionLogs.push({
      id: ++state.nextId,
      actionId,
      decision: 'too_big',
      timestamp: Date.now(),
    });

    const action1: Action = {
      ...original,
      id: ++state.nextId,
      name: part1Name.trim(),
      estimatedDurationMins: dur1,
      status: 'ready',
      deferredDateMs: null,
    };

    const action2: Action = {
      ...original,
      id: ++state.nextId,
      name: part2Name.trim(),
      estimatedDurationMins: dur2,
      status: 'ready',
      deferredDateMs: null,
    };

    state.actions.push(action1, action2);
    this.saveState(state);
    return state;
  }

  static addAction(actionData: Omit<Action, 'id'>): Action {
    const state = this.loadState();
    const newAction: Action = {
      ...actionData,
      id: ++state.nextId,
    };
    state.actions.push(newAction);
    this.saveState(state);
    return newAction;
  }

  static addParkedThought(actionId: number, actionName: string, thought: string): ParkedThought {
    const state = this.loadState();
    const newThought: ParkedThought = {
      id: ++state.nextId,
      actionId,
      actionName,
      thought: thought.trim(),
      timestamp: Date.now(),
    };
    state.parkedThoughts.push(newThought);
    this.saveState(state);
    return newThought;
  }

  static saveEveningReview(dateMs: number, completedText: string, blockedText: string): EveningReview {
    const state = this.loadState();
    const review: EveningReview = {
      id: ++state.nextId,
      dateMs,
      completedText: completedText.trim(),
      blockedText: blockedText.trim(),
      timestamp: Date.now(),
    };
    state.eveningReviews.push(review);
    this.saveState(state);
    return review;
  }

  static updateActionDelegation(actionId: number, delegation: any): NextMoveState {
    const state = this.loadState();
    const action = state.actions.find((a) => a.id === actionId);
    if (action) {
      action.delegation = delegation;
      this.saveState(state);
    }
    return state;
  }
}
