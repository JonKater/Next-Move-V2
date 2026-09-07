import React, { useState } from 'react';
import { Moon, X } from 'lucide-react';

interface EveningReviewDialogProps {
  onClose: () => void;
  onComplete: (completedText: string, blockedText: string) => void;
}

export const EveningReviewDialog: React.FC<EveningReviewDialogProps> = ({
  onClose,
  onComplete,
}) => {
  const [completedText, setCompletedText] = useState('');
  const [blockedText, setBlockedText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(completedText, blockedText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        id="evening-review-dialog"
        className="w-full max-w-md bg-[#FEF7FF] rounded-3xl p-6 shadow-xl border border-[#E7E0EC]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0EC]">
          <h2 className="text-xl font-bold text-[#1D1B20] flex items-center gap-2">
            <Moon className="w-5 h-5 text-[#6750A4]" />
            Close-and-Learn
          </h2>
          <button
            id="close-evening-review-btn"
            onClick={onClose}
            className="p-1 rounded-full text-[#49454F] hover:bg-[#E7E0EC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#49454F] mt-2 mb-4">
          Wrap up today's execution and calibrate tomorrow's compass.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D1B20] mb-1.5">
              What was completed?
            </label>
            <textarea
              id="review-completed-text"
              rows={3}
              placeholder="Highlights, shipped tasks, small wins..."
              value={completedText}
              onChange={(e) => setCompletedText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#E7E0EC]/40 border border-[#79747E]/30 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#6750A4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1B20] mb-1.5">
              What blocked unfinished work?
            </label>
            <textarea
              id="review-blocked-text"
              rows={3}
              placeholder="Energy dips, unclear context, interruptions..."
              value={blockedText}
              onChange={(e) => setBlockedText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#E7E0EC]/40 border border-[#79747E]/30 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#6750A4]"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              id="cancel-review-btn"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-[#49454F] rounded-xl hover:bg-[#E7E0EC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-review-btn"
              className="flex-1 py-2.5 bg-[#6750A4] hover:bg-[#594191] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Save &amp; Close Day
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
