import React, { useState } from 'react';
import { X, Server, Database, Plus, Trash2 } from 'lucide-react';
import { Harness, PersonalData } from '../types';

interface RegistryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  harnesses: Harness[];
  personalData: PersonalData[];
  onSave: (harnesses: Harness[], personalData: PersonalData[]) => void;
}

export const RegistryDialog: React.FC<RegistryDialogProps> = ({
  isOpen,
  onClose,
  harnesses,
  personalData,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'harnesses' | 'personal'>('harnesses');
  
  // Local copies for editing
  const [localHarnesses, setLocalHarnesses] = useState<Harness[]>([...harnesses]);
  const [localPersonalData, setLocalPersonalData] = useState<PersonalData[]>([...personalData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localHarnesses, localPersonalData);
    onClose();
  };

  const addHarness = () => {
    setLocalHarnesses([...localHarnesses, { id: Date.now().toString(), name: '', description: '', capabilities: '' }]);
  };

  const removeHarness = (id: string) => {
    setLocalHarnesses(localHarnesses.filter(h => h.id !== id));
  };

  const updateHarness = (id: string, field: keyof Harness, value: string) => {
    setLocalHarnesses(localHarnesses.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const addPersonalData = () => {
    setLocalPersonalData([...localPersonalData, { id: Date.now().toString(), key: '', value: '', description: '' }]);
  };

  const removePersonalData = (id: string) => {
    setLocalPersonalData(localPersonalData.filter(pd => pd.id !== id));
  };

  const updatePersonalData = (id: string, field: keyof PersonalData, value: string) => {
    setLocalPersonalData(localPersonalData.map(pd => pd.id === id ? { ...pd, [field]: value } : pd));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#FEF7FF] rounded-3xl shadow-xl border border-[#E7E0EC] max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-[#E7E0EC] shrink-0">
          <h2 className="text-xl font-bold text-[#1D1B20] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#6750A4]" />
            Harness Registry & Context
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#49454F] hover:bg-[#E7E0EC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-[#E7E0EC]/50 p-1 mx-6 mt-6 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('harnesses')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'harnesses' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#49454F] hover:text-[#1D1B20]'
            }`}
          >
            <Server className="w-4 h-4" /> AI Harnesses
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'personal' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#49454F] hover:text-[#1D1B20]'
            }`}
          >
            <Database className="w-4 h-4" /> Personal Database
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'harnesses' && (
            <>
              <p className="text-xs text-[#49454F] mb-4">
                Define the AI tools and agents available to you. The recommendation engine will pick the best one for delegable tasks.
              </p>
              {localHarnesses.map((harness) => (
                <div key={harness.id} className="p-4 bg-white border border-[#E7E0EC] rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      placeholder="Harness Name (e.g. Claude)"
                      value={harness.name}
                      onChange={(e) => updateHarness(harness.id, 'name', e.target.value)}
                      className="font-bold text-sm bg-transparent border-b border-transparent focus:border-[#6750A4] focus:outline-none w-1/2"
                    />
                    <button onClick={() => removeHarness(harness.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Description (e.g. Anthropic Claude models)"
                    value={harness.description}
                    onChange={(e) => updateHarness(harness.id, 'description', e.target.value)}
                    className="w-full text-xs text-[#49454F] bg-[#E7E0EC]/30 px-2 py-1.5 rounded focus:outline-none"
                  />
                  <textarea
                    placeholder="Capabilities & Context (e.g. Models: Haiku, Opus. Requires effort level.)"
                    value={harness.capabilities}
                    onChange={(e) => updateHarness(harness.id, 'capabilities', e.target.value)}
                    className="w-full text-xs text-[#1D1B20] bg-[#E7E0EC]/30 px-2 py-1.5 rounded focus:outline-none resize-none h-16"
                  />
                </div>
              ))}
              <button
                onClick={addHarness}
                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-[#6750A4]/30 rounded-xl text-[#6750A4] font-semibold text-sm hover:bg-[#6750A4]/5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Harness
              </button>
            </>
          )}

          {activeTab === 'personal' && (
            <>
              <p className="text-xs text-[#49454F] mb-4">
                Store permanent personal data (e.g., DOB, BG numbers) to inject context into AI prompts.
              </p>
              {localPersonalData.map((data) => (
                <div key={data.id} className="p-4 bg-white border border-[#E7E0EC] rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      placeholder="Key (e.g. Date of Birth)"
                      value={data.key}
                      onChange={(e) => updatePersonalData(data.id, 'key', e.target.value)}
                      className="font-bold text-sm bg-transparent border-b border-transparent focus:border-[#6750A4] focus:outline-none w-1/3"
                    />
                    <button onClick={() => removePersonalData(data.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Value (e.g. 1990-05-19)"
                    value={data.value}
                    onChange={(e) => updatePersonalData(data.id, 'value', e.target.value)}
                    className="w-full font-mono text-xs bg-[#EADDFF]/50 px-2 py-1.5 rounded border border-[#6750A4]/20 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Description / Context (e.g. DOB for official documents)"
                    value={data.description}
                    onChange={(e) => updatePersonalData(data.id, 'description', e.target.value)}
                    className="w-full text-xs text-[#49454F] bg-[#E7E0EC]/30 px-2 py-1.5 rounded focus:outline-none"
                  />
                </div>
              ))}
              <button
                onClick={addPersonalData}
                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-[#6750A4]/30 rounded-xl text-[#6750A4] font-semibold text-sm hover:bg-[#6750A4]/5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Personal Data
              </button>
            </>
          )}
        </div>

        <div className="p-6 border-t border-[#E7E0EC] bg-white rounded-b-3xl shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 font-semibold text-sm text-[#49454F] rounded-xl hover:bg-[#E7E0EC] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#6750A4] hover:bg-[#594191] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            Save Registry
          </button>
        </div>
      </div>
    </div>
  );
};
