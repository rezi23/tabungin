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

  const heightClass = size === 'sm' ? 'h-11 text-sm' : 'h-12 text-base';

  return (
    <div
      className={`group flex items-center rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15 ${heightClass} ${className}`}
    >
      <span
        aria-hidden="true"
        className="select-none pl-3.5 pr-1.5 text-sm font-medium text-slate-400 group-focus-within:text-teal-700"
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
        className="w-full min-w-0 bg-transparent pr-3.5 font-mono font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none tabular-nums"
      />
    </div>
  );
}
