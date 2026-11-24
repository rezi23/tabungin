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

  const heightClass =
    size === 'sm' ? 'h-8.5 text-xs' : 'h-10 text-sm';

  return (
    <div
      className={`group flex items-center rounded-lg border border-zinc-200/90 bg-white transition-all focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:border-zinc-300 dark:focus-within:ring-zinc-100/10 ${heightClass} ${className}`}
    >
      <span
        aria-hidden="true"
        className="select-none pl-2.5 pr-1 font-mono text-[11px] font-medium text-zinc-400 group-focus-within:text-zinc-800 dark:text-zinc-500 dark:group-focus-within:text-zinc-300"
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
        className="w-full min-w-0 bg-transparent pr-2.5 text-right font-mono font-semibold text-zinc-950 placeholder:text-zinc-300 focus:outline-none tabular-nums dark:text-zinc-100 dark:placeholder:text-zinc-600"
      />
    </div>
  );
}
