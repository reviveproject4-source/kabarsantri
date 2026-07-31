import React from 'react';
import { Sparkles, Video, Database, FileCode, CheckCircle2, SlidersHorizontal, Tv } from 'lucide-react';

interface HeaderProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onOpenJsonModal: () => void;
  logCount: number;
  evaluationPassed: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeStep,
  setActiveStep,
  onOpenJsonModal,
  logCount,
  evaluationPassed
}) => {
  const steps = [
    { id: 1, name: '1. Metric Filter', icon: SlidersHorizontal },
    { id: 2, name: '2. Deconstruct', icon: Video, disabled: evaluationPassed !== true },
    { id: 3, name: '3. Re-Strategy', icon: Sparkles, disabled: evaluationPassed !== true },
    { id: 4, name: '4. Media Studio', icon: Tv, disabled: evaluationPassed !== true },
    { id: 5, name: '5. Data Logs', icon: Database },
  ];


  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
              VIRAL CLONER <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">MINI APP</span>
            </h1>
            <p className="text-xs text-gray-400">Viral Video Metric Assessor & Re-Strategy Generator</p>
          </div>
        </div>

        {/* Workflow Steps Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isDisabled = step.disabled;

            return (
              <button
                key={step.id}
                onClick={() => !isDisabled && setActiveStep(step.id)}
                disabled={isDisabled}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : isDisabled
                    ? 'text-gray-600 cursor-not-allowed opacity-50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.name}</span>
                {step.id === 2 && evaluationPassed && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / JSON Modal Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenJsonModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
            title="View API JSON Payload"
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">JSON Output</span>
          </button>

          <button
            onClick={() => setActiveStep(5)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-medium border border-purple-800/40 transition"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Logs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-bold">{logCount}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
