import React from 'react';
import { formatDots, parseRupiahInput } from '../utils/finance';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  size?: 'md' | 'sm';
  inputRef?: React.Ref<HTMLInputElement>;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  placeholder = '0',
  ariaLabel,
  className = '',
  size = 'md',
  inputRef,
}: CurrencyInputProps) {
  const displayValue = value > 0 ? formatDots(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseRupiahInput(e.target.value);
    onChange(parsed);
  };

  const heightClass = size === 'sm' ? 'h-9 text-xs sm:text-[13px]' : 'h-10 text-sm';

  return (
    <div
      className={`group flex items-center rounded-lg border border-slate-200/90 bg-white shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-all focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-none dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400/20 ${heightClass} ${className}`}
    >
      <span
        aria-hidden="true"
        className="select-none pl-2.5 pr-1 text-xs font-medium text-slate-400 group-focus-within:text-teal-700 dark:text-slate-500 dark:group-focus-within:text-teal-400"
      >
        Rp
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent pr-2.5 font-mono font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none tabular-nums dark:text-slate-100 dark:placeholder:text-slate-600"
      />
    </div>
  );
}
