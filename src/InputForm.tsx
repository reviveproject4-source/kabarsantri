import React, { useState } from 'react';

interface InputFormProps {
  title: string;
  onSave: (val: string) => void;
}

export const InputForm = ({
  title,
  onSave,
}: InputFormProps) => {
  const [value, setValue] = useState('');

  const handleSave = () => {
    if (!value.trim()) return;

    onSave(value);
    setValue('');
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Masukkan ${title}`}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <button
        onClick={handleSave}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Simpan
      </button>
    </div>
  );
};