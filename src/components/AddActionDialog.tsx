import React, { useState } from 'react';
import { X, Plus, Clock, Zap, AlertCircle, Bookmark, Wand2, ListPlus } from 'lucide-react';
import { Action, ActionContext } from '../types';

interface AddActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (action: Omit<Action, 'id'>) => void;
  onAddBulk?: (actions: Omit<Action, 'id'>[]) => void;
  inboxProjectId: number;
}

export const AddActionDialog: React.FC<AddActionDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  onAddBulk,
  inboxProjectId,
}) => {
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [energyDemand, setEnergyDemand] = useState<number>(2);
  const [urgency, setUrgency] = useState<number>(2);
  const [strategicRelevance, setStrategicRelevance] = useState<number>(2);
  const [context, setContext] = useState<ActionContext>('Computer');
  const [isDailyWin, setIsDailyWin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk mode states
  const [bulkText, setBulkText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedActions, setExtractedActions] = useState<any[]>([]);

  if (!isOpen) return null;

  const resetManualForm = () => {
    setName('');
    setDuration(30);
    setEnergyDemand(2);
    setUrgency(2);
    setStrategicRelevance(2);
    setContext('Computer');
    setIsDailyWin(false);
    setError(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Action name is required');
      return;
    }
    if (duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }

    onAdd({
      projectId: inboxProjectId,
      name: name.trim(),
      estimatedDurationMins: duration,
      energyDemand,
      urgency,
      strategicRelevance,
      context,
      status: isDailyWin ? 'daily_win' : 'ready',
      deferredDateMs: null,
    });

    resetManualForm();
    onClose();
  };

  const handleExtractBulk = async () => {
    if (!bulkText.trim()) {
      setError('Please paste some text to extract actions from.');
      return;
    }
    
    setIsExtracting(true);
    setError(null);
    try {
      const response = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkText }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Extraction failed');
      }
      
      if (data.actions && Array.isArray(data.actions)) {
        setExtractedActions(data.actions);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract actions. Make sure GEMINI_API_KEY is configured.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmBulk = () => {
    if (onAddBulk && extractedActions.length > 0) {
      const actionsToAdd = extractedActions.map(a => ({
        projectId: inboxProjectId,
        name: a.name,
        estimatedDurationMins: a.estimatedDurationMins || 15,
        energyDemand: a.energyDemand || 2,
        urgency: a.urgency || 2,
        strategicRelevance: a.strategicRelevance || 2,
        context: (['Anywhere', 'Computer', 'Phone', 'Errands'].includes(a.context) ? a.context : 'Anywhere') as ActionContext,
        status: 'ready' as const,
        deferredDateMs: null,
      }));
      onAddBulk(actionsToAdd);
      
      setBulkText('');
      setExtractedActions([]);
      onClose();
    }
  };

  const contexts: ActionContext[] = ['Anywhere', 'Computer', 'Phone', 'Errands'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        id="add-action-dialog"
        className="w-full max-w-lg bg-[#FEF7FF] rounded-3xl p-6 shadow-xl border border-[#E7E0EC] max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E0EC] shrink-0">
          <h2 className="text-xl font-bold text-[#1D1B20] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#6750A4]" />
            New Action
          </h2>
          <button
            id="close-add-action-btn"
            onClick={onClose}
            className="p-1 rounded-full text-[#49454F] hover:bg-[#E7E0EC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-[#E7E0EC]/50 p-1 rounded-xl mt-4 shrink-0">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              mode === 'manual' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#49454F] hover:text-[#1D1B20]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Single
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              mode === 'bulk' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#49454F] hover:text-[#1D1B20]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> Bulk Add (AI)
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-4 overflow-y-auto pr-1">
          {mode === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D1B20] mb-1">
                  Action Name *
                </label>
                <input
                  id="action-name-input"
                  type="text"
                  placeholder="e.g., Draft weekly project update"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#E7E0EC]/50 border border-[#79747E]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1D1B20] mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#6750A4]" />
                    Est. Duration (mins)
                  </label>
                  <input
                    id="action-duration-input"
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#E7E0EC]/50 border border-[#79747E]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1D1B20] mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#6750A4]" />
                    Energy Demand
                  </label>
                  <select
                    id="action-energy-select"
                    value={energyDemand}
                    onChange={(e) => setEnergyDemand(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#E7E0EC]/50 border border-[#79747E]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  >
                    <option value={1}>1: Low</option>
                    <option value={2}>2: Medium</option>
                    <option value={3}>3: High (Deep Focus)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1D1B20] mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[#6750A4]" />
                    Urgency
                  </label>
                  <select
                    id="action-urgency-select"
                    value={urgency}
                    onChange={(e) => setUrgency(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#E7E0EC]/50 border border-[#79747E]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  >
                    <option value={1}>1: Low</option>
                    <option value={2}>2: Medium</option>
                    <option value={3}>3: High</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1D1B20] mb-1 flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-[#6750A4]" />
                    Strategic Relevance
                  </label>
                  <select
                    id="action-strategic-select"
                    value={strategicRelevance}
                    onChange={(e) => setStrategicRelevance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#E7E0EC]/50 border border-[#79747E]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  >
                    <option value={1}>1: Low</option>
                    <option value={2}>2: Medium</option>
                    <option value={3}>3: High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1B20] mb-1">
                  Required Context
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {contexts.map((ctx) => (
                    <button
                      key={ctx}
                      type="button"
                      onClick={() => setContext(ctx)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                        context === ctx
                          ? 'bg-[#EADDFF] border-[#6750A4] text-[#21005D] font-semibold'
                          : 'bg-white border-[#79747E]/20 text-[#49454F] hover:bg-neutral-50'
                      }`}
                    >
                      {ctx}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="action-daily-win-check"
                  type="checkbox"
                  checked={isDailyWin}
                  onChange={(e) => setIsDailyWin(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6750A4] focus:ring-[#6750A4]"
                />
                <label htmlFor="action-daily-win-check" className="text-xs text-[#1D1B20]">
                  Mark as Today's <span className="font-semibold text-[#6750A4]">Daily Win</span> (top priority)
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-[#49454F] rounded-xl hover:bg-[#E7E0EC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-create-action-btn"
                  className="flex-1 py-2.5 bg-[#6750A4] hover:bg-[#594191] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Add Action
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {extractedActions.length === 0 ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#1D1B20] mb-2">
                      Paste your brain dump, meeting notes, or raw list:
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="e.g., check for the garden, clean the pond, water the plants, mow the lawn..."
                      rows={6}
                      className="w-full px-3.5 py-2.5 bg-[#E7E0EC]/50 border border-[#79747E]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6750A4] resize-none"
                      autoFocus
                    />
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 text-xs font-semibold text-[#49454F] rounded-xl hover:bg-[#E7E0EC] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExtractBulk}
                      disabled={isExtracting || !bulkText.trim()}
                      className="flex-1 py-2.5 bg-[#6750A4] hover:bg-[#594191] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {isExtracting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Extract Actions
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#1D1B20]">
                      Extracted Actions ({extractedActions.length})
                    </h3>
                    <button
                      onClick={() => setExtractedActions([])}
                      className="text-xs text-[#6750A4] hover:underline font-semibold"
                    >
                      Edit Input
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {extractedActions.map((action, idx) => (
                      <div key={idx} className="bg-white border border-[#E7E0EC] p-3 rounded-xl shadow-sm">
                        <div className="font-semibold text-sm text-[#1D1B20] mb-1">
                          {action.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#49454F]">
                          <span className="flex items-center gap-1 bg-[#E7E0EC]/50 px-1.5 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-[#6750A4]" /> {action.estimatedDurationMins}m
                          </span>
                          <span className="flex items-center gap-1 bg-[#E7E0EC]/50 px-1.5 py-0.5 rounded-md">
                            <Zap className="w-3 h-3 text-[#6750A4]" /> {action.energyDemand}/3
                          </span>
                          <span className="flex items-center gap-1 bg-[#E7E0EC]/50 px-1.5 py-0.5 rounded-md">
                            {action.context}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExtractedActions([])}
                      className="flex-1 py-2.5 text-xs font-semibold text-[#49454F] rounded-xl hover:bg-[#E7E0EC] transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleConfirmBulk}
                      className="flex-1 py-2.5 bg-[#6750A4] hover:bg-[#594191] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <ListPlus className="w-4 h-4" />
                      Add {extractedActions.length} Actions
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
