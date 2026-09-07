import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Moon,
  Plus,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  MapPin,
  ChevronDown,
  ChevronUp,
  Server,
  Bot,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';
import { Action, DailyContext, ScoreExplanation, Harness, PersonalData } from '../types';
import { SplitActionDialog } from './SplitActionDialog';
import { EveningReviewDialog } from './EveningReviewDialog';
import { AddActionDialog } from './AddActionDialog';
import { NextMoveDB } from '../data/db';

interface NextMoveScreenProps {
  action: (Action & { explanation: ScoreExplanation }) | null;
  dailyContext: DailyContext | null;
  onStartFocus: () => void;
  onDecision: (action: Action, decision: 'completed' | 'too_big' | 'wrong_context' | 'not_now') => void;
  onSplit: (action: Action, p1: string, p2: string, d1: number, d2: number) => void;
  onOpenCompass: () => void;
  onLoadSampleData: () => void;
  onAddAction: (action: Omit<Action, 'id'>) => void;
  onAddBulkAction?: (actions: Omit<Action, 'id'>[]) => void;
  onSaveEveningReview: (completedText: string, blockedText: string) => void;
  onAdvanceDay: () => void;
  onOpenRegistry: () => void;
  completedCount: number;
  inboxProjectId: number;
  activeActionsCount: number;
  harnesses: Harness[];
  personalData: PersonalData[];
}

export const NextMoveScreen: React.FC<NextMoveScreenProps> = ({
  action,
  dailyContext,
  onStartFocus,
  onDecision,
  onSplit,
  onOpenCompass,
  onLoadSampleData,
  onAddAction,
  onAddBulkAction,
  onSaveEveningReview,
  onAdvanceDay,
  onOpenRegistry,
  completedCount,
  inboxProjectId,
  activeActionsCount,
  harnesses,
  personalData,
}) => {
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [isAnalyzingDelegation, setIsAnalyzingDelegation] = useState(false);
  const [delegationError, setDelegationError] = useState<string | null>(null);

  // Analyze delegation for the current action
  const handleAnalyzeDelegation = async () => {
    if (!action) return;
    setIsAnalyzingDelegation(true);
    setDelegationError(null);
    try {
      const response = await fetch('/api/analyze-delegation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: action.name,
          harnesses,
          personalData,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Delegation analysis failed');
      }
      
      // We mutate the action in place and save it via our new DB method
      NextMoveDB.updateActionDelegation(action.id, data);
      action.delegation = data; // locally update for immediate re-render
      
    } catch (err: any) {
      setDelegationError(err.message || 'Failed to analyze delegation.');
    } finally {
      setIsAnalyzingDelegation(false);
    }
  };

  return (
    <div id="next-move-screen" className="min-h-screen flex flex-col justify-between max-w-lg mx-auto px-4 py-6">
      {/* Top Header / Status bar */}
      <header className="w-full">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <button
              id="open-compass-btn"
              onClick={onOpenCompass}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8DEF8] hover:bg-[#DBCDEB] text-[#1D192B] rounded-full text-xs font-semibold transition-colors"
              title="Click to adjust Daily Compass"
            >
              <Sliders className="w-3.5 h-3.5 text-[#6750A4]" />
              <span>{dailyContext?.usableTimeMins ?? 60}m</span>
              <span className="text-[#625B71]">•</span>
              <span>Energy {dailyContext?.energyLevel ?? 2}/3</span>
              <span className="text-[#625B71]">•</span>
              <span>{dailyContext?.availableContext ?? 'Anywhere'}</span>
            </button>
            
            <button
              onClick={onOpenRegistry}
              className="p-1.5 bg-[#FEF7FF] hover:bg-[#E7E0EC] border border-[#79747E]/30 text-[#1D1B20] rounded-full transition-colors"
              title="Harness Registry & Context"
            >
              <Server className="w-3.5 h-3.5 text-[#6750A4]" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="add-action-btn"
              onClick={() => setShowAddAction(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FEF7FF] hover:bg-[#E7E0EC] border border-[#79747E]/30 text-[#1D1B20] text-xs font-semibold rounded-full transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#6750A4]" />
              Add
            </button>

            <button
              id="evening-review-btn"
              onClick={() => setShowEveningReview(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[#6750A4] hover:bg-[#EADDFF]/50 text-xs font-semibold rounded-full transition-colors"
            >
              <Moon className="w-3.5 h-3.5" />
              Evening Review
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center py-6">
        {action === null ? (
          /* Empty / Caught up state */
          <div id="all-caught-up-card" className="text-center py-10 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#EADDFF] text-[#6750A4] mb-6 shadow-sm">
              <RotateCcw className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#1D1B20] tracking-tight">
              You're all caught up.
            </h2>
            <p className="text-sm text-[#49454F] mt-2 max-w-xs mx-auto">
              No ready actions match your current context ({dailyContext?.availableContext ?? 'Anywhere'}) or available time.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="load-sample-data-btn"
                onClick={onLoadSampleData}
                className="px-5 py-3 bg-[#6750A4] hover:bg-[#594191] text-white text-sm font-semibold rounded-2xl shadow-xs transition-colors"
              >
                Load Sample Actions
              </button>
              <button
                id="empty-add-action-btn"
                onClick={() => setShowAddAction(true)}
                className="px-5 py-3 bg-white hover:bg-neutral-50 border border-[#79747E]/30 text-[#1D1B20] text-sm font-semibold rounded-2xl shadow-xs transition-colors"
              >
                + Create Action
              </button>
            </div>
          </div>
        ) : (
          /* Recommended Action View */
          <div className="w-full flex flex-col items-center">
            {/* Context Label badge */}
            <div className="inline-flex items-center gap-2 bg-[#E8DEF8] text-[#1D192B] rounded-2xl px-4 py-2 mb-4 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#6750A4]" />
              <span className="text-xs sm:text-sm font-semibold">
                Recommended for your current energy &amp; time
              </span>
            </div>

            {/* The Action Card - Aspect ratio 1:1 feel */}
            <div
              id="active-recommendation-card"
              className="w-full bg-[#EADDFF] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-sm min-h-[300px] border border-[#D0BCFF]/50 relative overflow-hidden"
            >
              <div className="w-full flex justify-between items-center text-xs font-medium text-[#21005D]/70 relative z-10">
                <span className="inline-flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full text-[#21005D] font-semibold">
                  <MapPin className="w-3 h-3" />
                  {action.context}
                </span>
                {action.status === 'daily_win' && (
                  <span className="bg-[#F59E0B] text-white px-2.5 py-1 rounded-full font-bold shadow-xs">
                    ★ Daily Win
                  </span>
                )}
                {action.score !== undefined && (
                  <button
                    type="button"
                    onClick={() => setShowScoreDetails(!showScoreDetails)}
                    className="inline-flex items-center gap-1 bg-white/70 hover:bg-white px-2.5 py-1 rounded-full text-[#21005D] transition-colors"
                  >
                    <span>Fit score: {action.score}</span>
                    {showScoreDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              <div className="my-auto py-6 relative z-10">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#21005D] leading-snug tracking-tight">
                  {action.name}
                </h1>
                <p className="mt-4 text-sm sm:text-base font-semibold text-[#21005D]/80 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{action.estimatedDurationMins}m</span>
                  <span>•</span>
                  <Zap className="w-4 h-4" />
                  <span>Energy: {action.energyDemand}/3</span>
                </p>
              </div>

              {/* Delegation Banner embedded inside Card */}
              <div className="w-full bg-white/40 rounded-2xl mt-4 p-3 border border-white/60 flex flex-col gap-2 text-left relative z-10">
                {!action.delegation ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#21005D] flex items-center gap-1.5">
                      <Bot className="w-4 h-4" /> AI Delegation Analysis
                    </span>
                    <button
                      onClick={handleAnalyzeDelegation}
                      disabled={isAnalyzingDelegation}
                      className="px-3 py-1.5 bg-[#6750A4] hover:bg-[#594191] disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wide"
                    >
                      {isAnalyzingDelegation ? 'Analyzing...' : 'Analyze Task'}
                    </button>
                  </div>
                ) : action.delegation.isDelegable ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#21005D] flex items-center gap-1.5 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-700" /> Delegable
                      </span>
                      <span className="text-xs font-bold text-[#6750A4] bg-white px-2 py-0.5 rounded-lg shadow-xs">
                        {action.delegation.recommendedHarness}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#21005D]/80">
                      <div className="bg-white/60 p-2 rounded-lg">
                        <span className="block font-semibold mb-0.5 flex items-center gap-1"><BrainCircuit className="w-3 h-3" /> Model</span>
                        {action.delegation.recommendedModel}
                      </div>
                      <div className="bg-white/60 p-2 rounded-lg">
                        <span className="block font-semibold mb-0.5 flex items-center gap-1"><Sliders className="w-3 h-3" /> Config</span>
                        {action.delegation.configuration}
                      </div>
                    </div>
                    
                    <div className="bg-white/60 p-2 rounded-lg text-[11px] text-[#21005D]/80">
                      <span className="block font-semibold mb-0.5 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Suggested Prompt</span>
                      <div className="font-mono mt-1 text-[#21005D] whitespace-pre-wrap">{action.delegation.prompt}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#21005D] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Not ideal for AI delegation
                    </span>
                    <span className="text-[10px] text-[#21005D]/70 max-w-[60%] text-right leading-tight">
                      {action.delegation.rationale}
                    </span>
                  </div>
                )}
                {delegationError && (
                  <div className="text-[10px] text-red-600 bg-red-100 p-1.5 rounded">{delegationError}</div>
                )}
              </div>
            </div>

            {/* Deterministic Scoring Explanation (Spec #9) */}
            {showScoreDetails && action.explanation && (
              <div id="scoring-explanation-panel" className="w-full mt-3 p-4 bg-[#FEF7FF] rounded-2xl border border-[#E7E0EC] shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#1D1B20] pb-1 border-b border-[#E7E0EC]">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#6750A4]" />
                    Deterministic Fit Explanation
                  </span>
                  <span className="text-[#6750A4]">{action.score} total points</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#49454F]">
                  <div>
                    • Duration fit ({action.estimatedDurationMins}m ≤ {dailyContext?.usableTimeMins}m):{' '}
                    <span className="font-semibold text-[#1D1B20]">
                      {action.explanation.durationScore > 0 ? '+5 pts' : '-10 pts'}
                    </span>
                  </div>
                  <div>
                    • Energy demand ({action.energyDemand} ≤ {dailyContext?.energyLevel}):{' '}
                    <span className="font-semibold text-[#1D1B20]">
                      {action.explanation.energyScore > 0 ? '+5 pts' : '-5 pts'}
                    </span>
                  </div>
                  <div>
                    • Urgency (rank {action.urgency}/3):{' '}
                    <span className="font-semibold text-[#1D1B20]">
                      +{action.explanation.urgencyScore} pts
                    </span>
                  </div>
                  <div>
                    • Relevance (rank {action.strategicRelevance}/3):{' '}
                    <span className="font-semibold text-[#1D1B20]">
                      +{action.explanation.strategicScore} pts
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full mt-6 space-y-3">
              {/* Primary: Start Focus Session */}
              <button
                id="start-focus-btn"
                onClick={onStartFocus}
                className="w-full h-16 bg-[#6750A4] hover:bg-[#594191] active:scale-[0.99] text-white font-semibold text-lg rounded-3xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6 fill-current" />
                Start Focus Session
              </button>

              {/* Secondary Actions: Too Big / Not Now */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="action-too-big-btn"
                  onClick={() => setShowSplitDialog(true)}
                  className="h-14 bg-[#E8DEF8] hover:bg-[#DBCDEB] text-[#1D192B] font-semibold text-sm rounded-2xl transition-colors flex items-center justify-center"
                >
                  Too big
                </button>
                <button
                  id="action-not-now-btn"
                  onClick={() => onDecision(action, 'not_now')}
                  className="h-14 bg-[#E8DEF8] hover:bg-[#DBCDEB] text-[#1D192B] font-semibold text-sm rounded-2xl transition-colors flex items-center justify-center"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Daily progress & tools */}
      <footer className="w-full pt-4 border-t border-[#E7E0EC]/80 flex items-center justify-between text-xs text-[#79747E]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#6750A4]" />
          <span>{completedCount} completed today</span>
          <span>•</span>
          <span>{activeActionsCount} active tasks</span>
        </div>

        <button
          id="advance-day-test-btn"
          onClick={onAdvanceDay}
          title="Simulates tomorrow so deferred tasks become eligible again"
          className="hover:text-[#6750A4] flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-[#EADDFF]/30 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Simulate Next Day</span>
        </button>
      </footer>

      {/* Dialogs */}
      {showSplitDialog && action && (
        <SplitActionDialog
          action={action}
          onClose={() => setShowSplitDialog(false)}
          onSplit={(p1, p2, d1, d2) => {
            onSplit(action, p1, p2, d1, d2);
            setShowSplitDialog(false);
          }}
        />
      )}

      {showEveningReview && (
        <EveningReviewDialog
          onClose={() => setShowEveningReview(false)}
          onComplete={(completedText, blockedText) => {
            onSaveEveningReview(completedText, blockedText);
            setShowEveningReview(false);
          }}
        />
      )}

      {showAddAction && (
        <AddActionDialog
          isOpen={showAddAction}
          onClose={() => setShowAddAction(false)}
          onAdd={onAddAction}
          onAddBulk={onAddBulkAction}
          inboxProjectId={inboxProjectId}
        />
      )}
    </div>
  );
};
