import React, { useState } from 'react';
import { Scissors, AlertCircle, X } from 'lucide-react';
import { Action } from '../types';

interface SplitActionDialogProps {
  action: Action;
  onClose: () => void;
  onSplit: (part1Name: string, part2Name: string, dur1: number, dur2: number) => void;
}

export const SplitActionDialog: React.FC<SplitActionDialogProps> = ({
  action,
  onClose,
  onSplit,
}) => {
  const halfDur = Math.max(5, Math.floor(action.estimatedDurationMins / 2));
  const [part1, setPart1] = useState<string>(`${action.name} (Part 1)`);
  const [dur1, setDur1] = useState<string>(String(halfDur));
  const [part2, setPart2] = useState<string>(`${action.name} (Part 2)`);
  const [dur2, setDur2] = useState<string>(String(halfDur));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!part1.trim() || !part2.trim()) {
      setError('Both sub-action names must be non-empty.');
      return;
    }
    const d1 = parseInt(dur1, 10);
    const d2 = parseInt(dur2, 10);
    if (isNaN(d1) || d1 <= 0 || isNaN(d2) || d2 <= 0) {
      setError('Both durations must be positive numbers.');
      return;
    }

    onSplit(part1.trim(), part2.trim(), d1, d2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        id="split-action-dialog"
        className="w-full max-w-md bg-[#FEF7FF] rounded-3xl p-6 shadow-xl border border-[#E7E0EC]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0EC]">
          <h2 className="text-xl font-bold text-[#1D1B20] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#6750A4]" />
            Split Action
          </h2>
          <button
            id="close-split-dialog-btn"
            onClick={onClose}
            className="p-1 rounded-full text-[#49454F] hover:bg-[#E7E0EC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#49454F] mt-2 mb-4">
          Break this large task into two bite-sized, atomic steps that fit your usable time.
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#E7E0EC]/40 p-3.5 rounded-2xl border border-[#79747E]/20 space-y-2.5">
            <label className="block text-xs font-bold text-[#6750A4] uppercase tracking-wider">
              Sub-task 1
            </label>
            <div>
              <input
                id="split-part1-name"
                type="text"
                placeholder="Part 1 description"
                value={part1}
                onChange={(e) => setPart1(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#79747E]/30 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#6750A4]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#49454F]">Duration:</span>
              <input
                id="split-part1-dur"
                type="number"
                min={1}
                value={dur1}
                onChange={(e) => setDur1(e.target.value)}
                className="w-20 px-2.5 py-1 bg-white border border-[#79747E]/30 rounded-lg text-sm"
              />
              <span className="text-xs text-[#49454F]">mins</span>
            </div>
          </div>

          <div className="bg-[#E7E0EC]/40 p-3.5 rounded-2xl border border-[#79747E]/20 space-y-2.5">
            <label className="block text-xs font-bold text-[#6750A4] uppercase tracking-wider">
              Sub-task 2
            </label>
            <div>
              <input
                id="split-part2-name"
                type="text"
                placeholder="Part 2 description"
                value={part2}
                onChange={(e) => setPart2(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#79747E]/30 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#6750A4]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#49454F]">Duration:</span>
              <input
                id="split-part2-dur"
                type="number"
                min={1}
                value={dur2}
                onChange={(e) => setDur2(e.target.value)}
                className="w-20 px-2.5 py-1 bg-white border border-[#79747E]/30 rounded-lg text-sm"
              />
              <span className="text-xs text-[#49454F]">mins</span>
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              id="cancel-split-btn"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-[#49454F] rounded-xl hover:bg-[#E7E0EC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-split-btn"
              className="flex-1 py-2.5 bg-[#6750A4] hover:bg-[#594191] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Split
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
