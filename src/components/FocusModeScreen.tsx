import React, { useState } from 'react';
import { CheckCircle, Clock, Zap, ArrowLeft, Lightbulb } from 'lucide-react';
import { Action } from '../types';

interface FocusModeScreenProps {
  action: Action;
  onComplete: (parkedThought: string) => void;
  onStop: () => void;
}

export const FocusModeScreen: React.FC<FocusModeScreenProps> = ({
  action,
  onComplete,
  onStop,
}) => {
  const [parkedThought, setParkedThought] = useState('');

  const handleComplete = () => {
    onComplete(parkedThought);
  };

  return (
    <div id="focus-mode-screen" className="min-h-screen flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto">
      <div className="w-full flex justify-start mb-6">
        <button
          onClick={onStop}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6750A4] hover:bg-[#EADDFF]/50 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Next Move
        </button>
      </div>

      <div className="text-center w-full mb-8">
        <span className="text-sm font-semibold tracking-wide uppercase text-[#625B71]">
          Focusing on
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1B20] mt-3 tracking-tight leading-tight px-2">
          {action.name}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4 text-xs font-semibold text-[#625B71]">
          <span className="inline-flex items-center gap-1 bg-[#E8DEF8] px-3 py-1 rounded-full text-[#1D192B]">
            <Clock className="w-3.5 h-3.5" />
            {action.estimatedDurationMins} mins
          </span>
          <span className="inline-flex items-center gap-1 bg-[#E8DEF8] px-3 py-1 rounded-full text-[#1D192B]">
            <Zap className="w-3.5 h-3.5" />
            Energy {action.energyDemand}/3
          </span>
        </div>
      </div>

      {/* Park a thought input */}
      <div className="w-full mb-10 bg-[#E7E0EC]/40 p-4 rounded-3xl border border-[#79747E]/20">
        <label htmlFor="parked-thought-input" className="text-xs font-semibold text-[#49454F] mb-1.5 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
          Park a thought...
        </label>
        <textarea
          id="parked-thought-input"
          rows={3}
          value={parkedThought}
          onChange={(e) => setParkedThought(e.target.value)}
          placeholder="Got distracted or had a sudden idea? Write it down here to stay focused on this task..."
          className="w-full px-3.5 py-2.5 bg-white border border-[#79747E]/30 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#6750A4]"
        />
      </div>

      {/* Primary Complete Button */}
      <button
        id="complete-focus-button"
        onClick={handleComplete}
        className="w-full h-16 bg-[#6750A4] hover:bg-[#594191] active:scale-[0.99] text-white font-semibold text-lg rounded-3xl shadow-sm transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-6 h-6" />
        Complete Action
      </button>

      {/* Stop Focus Button */}
      <button
        id="stop-focus-button"
        onClick={onStop}
        className="w-full h-12 mt-3 text-sm font-semibold text-[#49454F] hover:text-[#1D1B20] hover:bg-[#E7E0EC]/50 rounded-2xl transition-colors"
      >
        Stop Focus
      </button>
    </div>
  );
};
