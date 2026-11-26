import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

const fmtNum = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface MoneyInputProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
  badge?: string;
  large?: boolean;
  accent?: 'default' | 'strong';
}

export function MoneyInput({ value, onChange, label, badge, large, accent = 'default' }: MoneyInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const shown = draft ?? fmtNum.format(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^\d]/g, '');
    if (!digits) {
      setDraft('');
      onChange(0);
      return;
    }
    const numero = parseInt(digits, 10) / 100;
    setDraft(fmtNum.format(numero));
    onChange(numero);
  };

  const handleBlur = () => {
    setDraft(null);
  };

  const accentClass =
    accent === 'strong'
      ? 'bg-white border-2 border-teal-500 focus:border-teal-800 text-lg'
      : 'bg-stone-50 border-2 border-stone-200 focus:border-teal-700 text-base';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">{label}</label>
        {badge && (
          <span className="text-[11px] font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            {badge}
          </span>
        )}
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500 font-bold pointer-events-none">
          R$
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={shown}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-11 pr-4 py-2.5 font-extrabold text-teal-950 rounded-xl focus:outline-none transition-all ${accentClass} ${large ? 'text-xl py-3' : ''}`}
        />
      </div>
    </div>
  );
}

export function useFormattedPercent(initial: number) {
  return useMemo(() => fmtNum.format(initial), [initial]);
}

export default MoneyInput;
