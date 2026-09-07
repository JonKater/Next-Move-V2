import { useState, useEffect, useMemo, useCallback } from 'react';
import { NextMoveDB, getTodayStartMs, NextMoveState } from './data/db';
import { getScoredActions, getTopRecommendation } from './data/recommendation';
import { DailyCompassScreen } from './components/DailyCompassScreen';
import { NextMoveScreen } from './components/NextMoveScreen';
import { FocusModeScreen } from './components/FocusModeScreen';
import { RegistryDialog } from './components/RegistryDialog';
import { Action, DailyContext, Harness, PersonalData } from './types';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<NextMoveState>(() => NextMoveDB.getState());
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [forceShowCompass, setForceShowCompass] = useState<boolean>(false);
  const [showRegistry, setShowRegistry] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Today's local start timestamp (with simulated day offset)
  const currentTodayStartMs = useMemo(() => getTodayStartMs(dayOffset), [dayOffset]);

  // Current daily context for today's dateMs
  const currentDailyContext: DailyContext | null = useMemo(() => {
    const found = state.dailyContexts.find((c) => c.dateMs === currentTodayStartMs);
    return found ?? null;
  }, [state.dailyContexts, currentTodayStartMs]);

  // Check if compass is needed: no context for today, or context was for a past day
  const needsCompass = useMemo(() => {
    if (forceShowCompass) return true;
    return currentDailyContext === null;
  }, [forceShowCompass, currentDailyContext]);

  // Active project IDs
  const activeProjectIds = useMemo(() => {
    return new Set(
      state.projects.filter((p) => p.status === 'active').map((p) => p.id)
    );
  }, [state.projects]);

  // Scored actions matching current context & active projects
  const scoredActions = useMemo(() => {
    return getScoredActions(state.actions, activeProjectIds, currentDailyContext);
  }, [state.actions, activeProjectIds, currentDailyContext]);

  // Top recommendation
  const topAction = useMemo(() => {
    return getTopRecommendation(scoredActions);
  }, [scoredActions]);

  // Completed count for current day
  const completedCountToday = useMemo(() => {
    return state.decisionLogs.filter(
      (log) => log.decision === 'completed' && log.timestamp >= currentTodayStartMs
    ).length;
  }, [state.decisionLogs, currentTodayStartMs]);

  // Active actions count
  const activeActionsCount = useMemo(() => {
    return state.actions.filter(
      (a) =>
        activeProjectIds.has(a.projectId) &&
        (a.status === 'ready' || a.status === 'daily_win')
    ).length;
  }, [state.actions, activeProjectIds]);

  // Inbox project ID
  const inboxProjectId = useMemo(() => {
    let inbox = state.projects.find((p) => p.name.toLowerCase() === 'inbox');
    if (!inbox) return 1;
    return inbox.id;
  }, [state.projects]);

  // Submit Daily Compass
  const handleSubmitCompass = (timeMins: number, energy: number, context: string) => {
    NextMoveDB.saveDailyContext(timeMins, energy, context, currentTodayStartMs);
    setState(NextMoveDB.getState());
    setForceShowCompass(false);
    showToast(`Compass calibrated: ${timeMins}m, Energy ${energy}/3, ${context}`);
  };

  // Handle action decision (not_now or completed)
  const handleActionDecision = (
    action: Action,
    decision: 'completed' | 'too_big' | 'wrong_context' | 'not_now'
  ) => {
    if (decision === 'not_now') {
      NextMoveDB.deferActionForDate(action.id, currentTodayStartMs);
      setState(NextMoveDB.getState());
      showToast(`Deferred "${action.name}" for today.`);
    } else if (decision === 'completed') {
      NextMoveDB.recordDecision(action.id, 'completed', 'completed');
      setState(NextMoveDB.getState());
      showToast(`Completed "${action.name}"!`);
    } else {
      NextMoveDB.recordDecision(action.id, decision, 'ready');
      setState(NextMoveDB.getState());
    }
  };

  // Handle split action
  const handleSplitAction = (
    action: Action,
    p1: string,
    p2: string,
    d1: number,
    d2: number
  ) => {
    NextMoveDB.splitActionAtomically(action.id, p1, p2, d1, d2);
    setState(NextMoveDB.getState());
    showToast(`Split "${action.name}" into 2 sub-actions.`);
  };

  // Add new action
  const handleAddAction = (actionData: Omit<Action, 'id'>) => {
    NextMoveDB.addAction(actionData);
    setState(NextMoveDB.getState());
    showToast(`Added action "${actionData.name}".`);
  };

  // Add bulk actions
  const handleAddBulkActions = (actionsData: Omit<Action, 'id'>[]) => {
    actionsData.forEach(actionData => NextMoveDB.addAction(actionData));
    setState(NextMoveDB.getState());
    showToast(`Added ${actionsData.length} actions.`);
  };

  // Save evening review
  const handleSaveEveningReview = (completedText: string, blockedText: string) => {
    NextMoveDB.saveEveningReview(currentTodayStartMs, completedText, blockedText);
    setState(NextMoveDB.getState());
    showToast('Evening review saved.');
  };

  // Complete in Focus mode
  const handleCompleteFocus = (parkedThought: string) => {
    if (!topAction) return;

    if (parkedThought.trim()) {
      NextMoveDB.addParkedThought(topAction.id, topAction.name, parkedThought);
    }

    NextMoveDB.recordDecision(topAction.id, 'completed', 'completed');
    setState(NextMoveDB.getState());
    setIsFocusMode(false);
    showToast(`Completed focus session on "${topAction.name}"!`);
  };

  // Reset to sample data
  const handleLoadSampleData = () => {
    const newState = NextMoveDB.resetToSampleData();
    setState(newState);
    showToast('Loaded sample goals, projects, and actions.');
  };

  // Advance day simulation
  const handleAdvanceDay = () => {
    setDayOffset((prev) => prev + 1);
    setIsFocusMode(false);
    setForceShowCompass(false);
    showToast('Advanced to next local day! Deferred tasks are now eligible.');
  };

  const handleSaveRegistry = (harnesses: Harness[], personalData: PersonalData[]) => {
    // Save to DB
    const state = NextMoveDB.getState();
    state.harnesses = harnesses;
    state.personalData = personalData;
    // @ts-ignore - Need to expose this via DB method ideally but doing it directly for speed
    localStorage.setItem('next_move_db_v1', JSON.stringify(state));
    setState(state);
    showToast('Registry and Personal Data saved.');
  };

  // Sync state if external change
  useEffect(() => {
    const fresh = NextMoveDB.getState();
    setState(fresh);
  }, []);

  return (
    <div className="min-h-screen bg-[#FEF7FF] text-[#1D1B20]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#21005D] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-[#6750A4]/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#D0BCFF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <RegistryDialog
        isOpen={showRegistry}
        onClose={() => setShowRegistry(false)}
        harnesses={state.harnesses || []}
        personalData={state.personalData || []}
        onSave={handleSaveRegistry}
      />

      {/* Simulated Date Notice if dayOffset > 0 */}
      {dayOffset > 0 && (
        <div className="bg-[#EADDFF] text-[#21005D] text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-[#D0BCFF]">
          <span>Simulated day: +{dayOffset} day(s) from system start</span>
          <button
            onClick={() => setDayOffset(0)}
            className="underline hover:text-[#6750A4] text-xs font-bold inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to real date
          </button>
        </div>
      )}

      {/* Main View Router */}
      {isFocusMode && topAction ? (
        <FocusModeScreen
          action={topAction}
          onComplete={handleCompleteFocus}
          onStop={() => setIsFocusMode(false)}
        />
      ) : needsCompass ? (
        <DailyCompassScreen
          initialTime={currentDailyContext?.usableTimeMins ?? 60}
          initialEnergy={currentDailyContext?.energyLevel ?? 2}
          initialContext={currentDailyContext?.availableContext ?? 'Anywhere'}
          onSubmit={handleSubmitCompass}
          onCancel={currentDailyContext ? () => setForceShowCompass(false) : undefined}
          isEditing={forceShowCompass && currentDailyContext !== null}
        />
      ) : (
        <NextMoveScreen
          action={topAction}
          dailyContext={currentDailyContext}
          onStartFocus={() => setIsFocusMode(true)}
          onDecision={handleActionDecision}
          onSplit={handleSplitAction}
          onOpenCompass={() => setForceShowCompass(true)}
          onLoadSampleData={handleLoadSampleData}
          onAddAction={handleAddAction}
          onAddBulkAction={handleAddBulkActions}
          onSaveEveningReview={handleSaveEveningReview}
          onAdvanceDay={handleAdvanceDay}
          onOpenRegistry={() => setShowRegistry(true)}
          completedCount={completedCountToday}
          inboxProjectId={inboxProjectId}
          activeActionsCount={activeActionsCount}
          harnesses={state.harnesses || []}
          personalData={state.personalData || []}
        />
      )}
    </div>
  );
}
