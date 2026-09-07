import React, { useState } from 'react';
import { Compass, Clock, Zap, MapPin } from 'lucide-react';
import { ActionContext } from '../types';

interface DailyCompassScreenProps {
  initialTime?: number;
  initialEnergy?: number;
  initialContext?: string;
  onSubmit: (timeMins: number, energy: number, context: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const DailyCompassScreen: React.FC<DailyCompassScreenProps> = ({
  initialTime = 60,
  initialEnergy = 2,
  initialContext = 'Anywhere',
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [timeSlider, setTimeSlider] = useState<number>(initialTime);
  const [energySlider, setEnergySlider] = useState<number>(initialEnergy);
  const [availableContext, setAvailableContext] = useState<string>(initialContext);

  const getEnergyLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Low (Brain Dead)';
      case 2:
        return 'Medium (Normal)';
      case 3:
      default:
        return 'High (Deep Focus)';
    }
  };

  const contexts: ActionContext[] = ['Anywhere', 'Computer', 'Phone', 'Errands'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(timeSlider, energySlider, availableContext);
  };

  return (
    <div id="daily-compass-screen" className="min-h-screen flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EADDFF] text-[#21005D] mb-4 shadow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1D1B20]">
          {isEditing ? 'Adjust Compass' : 'Morning Compass'}
        </h1>
        <p className="mt-2 text-base text-[#49454F]">
          {isEditing ? 'Update your baseline for today.' : 'Set your daily baseline.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        {/* Card */}
        <div className="bg-[#E7E0EC] rounded-[24px] p-6 sm:p-7 shadow-xs">
          {/* Usable Time */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="usable-time-slider" className="text-sm font-semibold text-[#1D1B20] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6750A4]" />
                Usable Time
              </label>
              <span className="text-sm font-bold text-[#6750A4] bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                {timeSlider} mins
              </span>
            </div>
            <input
              id="usable-time-slider"
              type="range"
              min={15}
              max={240}
              step={15}
              value={timeSlider}
              onChange={(e) => setTimeSlider(Number(e.target.value))}
              className="w-full h-2.5 bg-[#CCC2DC] rounded-lg appearance-none cursor-pointer accent-[#6750A4]"
            />
            <div className="flex justify-between text-xs text-[#79747E] mt-1 px-0.5">
              <span>15m</span>
              <span>1h</span>
              <span>2h</span>
              <span>4h</span>
            </div>
          </div>

          {/* Energy Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="energy-slider" className="text-sm font-semibold text-[#1D1B20] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#6750A4]" />
                Energy
              </label>
              <span className="text-xs font-bold text-[#6750A4] bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                {getEnergyLabel(energySlider)}
              </span>
            </div>
            <input
              id="energy-slider"
              type="range"
              min={1}
              max={3}
              step={1}
              value={energySlider}
              onChange={(e) => setEnergySlider(Number(e.target.value))}
              className="w-full h-2.5 bg-[#CCC2DC] rounded-lg appearance-none cursor-pointer accent-[#6750A4]"
            />
            <div className="flex justify-between text-xs text-[#79747E] mt-1 px-1">
              <span>1: Low</span>
              <span>2: Medium</span>
              <span>3: High</span>
            </div>
          </div>

          {/* Available Context */}
          <div>
            <label className="text-sm font-semibold text-[#1D1B20] flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#6750A4]" />
              Available context
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#CCC2DC]/50 p-1.5 rounded-2xl">
              {contexts.map((ctx) => {
                const isSelected = availableContext === ctx;
                return (
                  <button
                    key={ctx}
                    type="button"
                    id={`context-btn-${ctx.toLowerCase()}`}
                    onClick={() => setAvailableContext(ctx)}
                    className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#6750A4] text-white shadow-xs font-semibold'
                        : 'text-[#49454F] hover:bg-white/50'
                    }`}
                  >
                    {ctx}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="submit"
            id="submit-compass-button"
            data-testid="submit_compass_button"
            className="w-full h-14 bg-[#6750A4] hover:bg-[#594191] active:scale-[0.99] text-white font-medium text-base rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isEditing ? 'Save Changes' : 'Set Compass'}
          </button>

          {isEditing && onCancel && (
            <button
              type="button"
              id="cancel-compass-button"
              onClick={onCancel}
              className="w-full h-12 text-[#6750A4] font-medium text-sm rounded-xl hover:bg-[#EADDFF]/40 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
