import React, { useState } from 'react';
import { StandardApiResponse } from '../types';
import { X, Copy, Check, FileCode } from 'lucide-react';

interface JsonOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiResponse: StandardApiResponse;
}

export const JsonOutputModal: React.FC<JsonOutputModalProps> = ({
  isOpen,
  onClose,
  apiResponse
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(apiResponse, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F172A] border border-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">Backend Execution Engine JSON Output</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Code Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-purple-200 bg-[#070B14] leading-relaxed flex-1">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/60 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">Format matching API Output Specification</span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON Payload'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
