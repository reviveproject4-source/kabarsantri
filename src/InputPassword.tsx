import React, { useState } from 'react';

interface InputPasswordProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}

export function InputPassword({
  value,
  onChange,
  placeholder,
  className,
  onKeyDown,
  inputMode,
  maxLength,
}: InputPasswordProps) {
  const [terlihat, setTerlihat] = useState(false);

  return (
    <div className={`relative ${className ?? ''}`}>
      <input
        type={terlihat ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full border rounded-lg px-3 py-2 pr-10"
      />

      <button
        type="button"
        onClick={() => setTerlihat((v) => !v)}
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {terlihat ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
