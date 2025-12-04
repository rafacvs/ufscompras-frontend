import { useState } from 'react';

type ChipInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  helperText?: string;
};

const ChipInput = ({ label, values, onChange, placeholder, helperText }: ChipInputProps) => {
  const [draft, setDraft] = useState('');

  const addValues = (input: string) => {
    const nextValues = input
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length);
    if (!nextValues.length) return;
    const merged = Array.from(new Set([...values, ...nextValues]));
    onChange(merged);
    setDraft('');
  };

  const removeValue = (value: string) => {
    onChange(values.filter((item) => item !== value));
  };

  return (
    <label className="block text-sm">
      <span className="text-offwhite/70">{label}</span>
      <div className="mt-2 rounded-2xl border border-offwhite/15 bg-[#14121a] p-3">
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => removeValue(value)}
              className="group inline-flex items-center gap-2 rounded-full bg-offwhite/10 px-3 py-1 text-xs text-offwhite"
            >
              {value}
              <span className="text-offwhite/40 group-hover:text-orange">×</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addValues(draft);
            }
          }}
          onBlur={() => addValues(draft)}
          placeholder={placeholder ?? 'Digite valores separados por vírgula'}
          className="mt-3 w-full border-none bg-transparent text-sm text-offwhite placeholder:text-offwhite/30 focus:outline-none"
        />
        {helperText && <p className="mt-1 text-xs text-offwhite/50">{helperText}</p>}
      </div>
    </label>
  );
};

export default ChipInput;

