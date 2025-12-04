type CategorySelectProps = {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
};

const CategorySelect = ({ label, value, onChange, options, disabled }: CategorySelectProps) => {
  return (
    <label className="block text-sm">
      <span className="text-offwhite/70">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
        disabled={disabled}
        className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-sm text-offwhite focus:border-purple focus:outline-none disabled:opacity-50"
      >
        <option value="">{disabled ? 'Carregando...' : 'Selecione uma categoria'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default CategorySelect;

