import React, { useRef, useState } from 'react';
import {
  Building2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
  User,
} from 'lucide-react';
import type { ExpenseItem, FinanceMode, ModeFinancialData } from '../types/finance';
import { formatPercent, formatRupiah } from '../utils/finance';
import { getQuickCategories } from '../utils/presets';
import { CurrencyInput } from './CurrencyInput';

interface FinanceInputPanelProps {
  mode: FinanceMode;
  data: ModeFinancialData;
  totalExpenses: number;
  canUndoReset: boolean;
  onModeChange: (mode: FinanceMode) => void;
  onUpdateCash: (cash: number) => void;
  onUpdateIncome: (income: number) => void;
  onAddExpense: (name: string, amount?: number) => string;
  onUpdateExpense: (id: string, patch: Partial<Omit<ExpenseItem, 'id'>>) => void;
  onDeleteExpense: (id: string) => void;
  onLoadSample: () => void;
  onResetData: () => void;
  onUndoReset: () => void;
}

export function FinanceInputPanel({
  mode,
  data,
  totalExpenses,
  canUndoReset,
  onModeChange,
  onUpdateCash,
  onUpdateIncome,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onLoadSample,
  onResetData,
  onUndoReset,
}: FinanceInputPanelProps) {
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState(0);
  const [customError, setCustomError] = useState('');
  const amountRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isCompany = mode === 'company';
  const quickCategories = getQuickCategories(mode);
  const existingNames = new Set(data.expenses.map((item) => item.name.trim().toLowerCase()));

  const handleQuickCategoryClick = (categoryName: string) => {
    const newId = onAddExpense(categoryName, 0);
    window.requestAnimationFrame(() => {
      amountRefs.current[newId]?.focus();
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) {
      setCustomError('Masukkan nama pengeluaran terlebih dahulu.');
      return;
    }
    setCustomError('');
    const newId = onAddExpense(trimmed, customAmount);
    setCustomName('');
    setCustomAmount(0);
    if (customAmount === 0) {
      window.requestAnimationFrame(() => {
        amountRefs.current[newId]?.focus();
      });
    }
  };

  return (
    <section
      id="input-keuangan"
      aria-label="Form Input Keuangan"
      className="space-y-4"
    >
      {/* Unified Executive Profile, Cash & Income Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-8px_rgba(15,23,42,0.05)] dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.03]">
        {/* Top Row: Segmented Mode Switcher + Compact Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="tablist"
            aria-label="Mode Keuangan"
            className="grid flex-1 grid-cols-2 gap-1 rounded-lg bg-slate-100/90 p-0.5 dark:bg-slate-950/90"
          >
            <button
              type="button"
              role="tab"
              id="tab-personal"
              aria-selected={mode === 'personal'}
              onClick={() => onModeChange('personal')}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                mode === 'personal'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Mode Pribadi</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-company"
              aria-selected={mode === 'company'}
              onClick={() => onModeChange('company')}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                mode === 'company'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Mode Perusahaan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onResetData}
            title="Reset seluruh data mode ini ke Rp 0"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-semibold text-slate-600 whitespace-nowrap transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-red-800/80 dark:hover:bg-red-950/60 dark:hover:text-red-400"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        {canUndoReset && (
          <div
            role="status"
            className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white dark:bg-slate-800 dark:ring-1 dark:ring-slate-700"
          >
            <span>Data {isCompany ? 'Perusahaan' : 'Pribadi'} direset ke Rp 0.</span>
            <button
              type="button"
              onClick={onUndoReset}
              className="inline-flex h-7 items-center gap-1 rounded-md bg-white/15 px-2 font-semibold text-white whitespace-nowrap transition-colors hover:bg-white/25"
            >
              <Undo2 className="h-3 w-3" aria-hidden="true" />
              <span>Urungkan</span>
            </button>
          </div>
        )}

        {/* Cash & Income Side-by-Side Grid */}
        <div className="mt-3.5 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
              {isCompany ? 'Posisi Kas & Omzet Perusahaan' : 'Posisi Kas & Pendapatan'}
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Auto-save aktif
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="input-cash"
                className="block text-[11px] font-medium text-slate-600 dark:text-slate-400"
              >
                {isCompany ? 'Total Kas Perusahaan' : 'Total Kas / Rekening'}
              </label>
              <div className="mt-1">
                <CurrencyInput
                  id="input-cash"
                  value={data.cash}
                  onChange={onUpdateCash}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="input-income"
                className="block text-[11px] font-medium text-slate-600 dark:text-slate-400"
              >
                {isCompany ? 'Omzet per Bulan' : 'Pendapatan per Bulan'}
              </label>
              <div className="mt-1">
                <CurrencyInput
                  id="input-income"
                  value={data.income}
                  onChange={onUpdateIncome}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Expenses Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-8px_rgba(15,23,42,0.05)] dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.03]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
              {isCompany ? 'Pengeluaran Operasional Bulanan' : 'Pengeluaran Bulanan'}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {data.expenses.length} pos · Total{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {formatRupiah(totalExpenses)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newId = onAddExpense('', 0);
              window.requestAnimationFrame(() => {
                const nameEl = document.getElementById(`expense-name-${newId}`);
                nameEl?.focus();
              });
            }}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-900 px-2.5 text-[11px] font-semibold text-white whitespace-nowrap transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tambah Baris</span>
          </button>
        </div>

        {/* Compact Quick-Add Interactive Category Chips */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5">
            {quickCategories.map((category) => {
              const alreadyAdded = existingNames.has(category.toLowerCase());
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleQuickCategoryClick(category)}
                  className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    alreadyAdded
                      ? 'border-teal-200/90 bg-teal-50/80 text-teal-800 hover:bg-teal-100/80 dark:border-teal-800/70 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60'
                      : 'border-slate-200/80 bg-slate-50/90 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <Plus className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Custom Category Quick Add Form */}
        <form
          onSubmit={handleCustomSubmit}
          className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800/80"
        >
          <div className="flex flex-col gap-1.5 sm:flex-row">
            <input
              id="custom-expense-name"
              type="text"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                if (customError) setCustomError('');
              }}
              aria-label="Nama pengeluaran kustom"
              placeholder={
                isCompany ? 'Tambah pos operasional...' : 'Tambah pos kustom (mis. Gym)...'
              }
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
            />
            <div className="flex gap-1.5">
              <CurrencyInput
                size="sm"
                value={customAmount}
                onChange={setCustomAmount}
                ariaLabel="Nominal pengeluaran baru"
                placeholder="Nominal"
                className="flex-1 sm:w-32 sm:flex-none"
              />
              <button
                type="submit"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
          {customError && (
            <p role="alert" className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
              {customError}
            </p>
          )}
        </form>

        {/* Dense Expense Items List */}
        <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
          {data.expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Belum ada pengeluaran tercatat
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Klik kategori cepat di atas atau tambahkan pos kustom.
              </p>
              <button
                type="button"
                onClick={onLoadSample}
                className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 whitespace-nowrap transition-colors hover:border-teal-300 hover:bg-teal-50/60 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300"
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span>Isi Contoh Data</span>
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70" aria-label="Daftar item pengeluaran">
              {data.expenses.map((item, idx) => {
                const share =
                  totalExpenses > 0 && item.amount > 0
                    ? (item.amount / totalExpenses) * 100
                    : 0;
                const safeLabel = item.name.trim() || `Pengeluaran #${idx + 1}`;
                return (
                  <li key={item.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <div className="relative min-w-0 flex-1">
                        <input
                          id={`expense-name-${item.id}`}
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            onUpdateExpense(item.id, { name: e.target.value })
                          }
                          aria-label={`Nama pengeluaran ${idx + 1}`}
                          placeholder="Nama pos pengeluaran"
                          className="h-9 w-full rounded-lg border border-slate-200/80 bg-slate-50/70 pr-12 pl-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/15 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:bg-slate-950 dark:focus:ring-teal-400/20"
                        />
                        {share > 0 && (
                          <span
                            title="Porsi dari total pengeluaran"
                            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 tabular-nums dark:bg-slate-800 dark:text-slate-400"
                          >
                            {formatPercent(share, 0)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CurrencyInput
                          size="sm"
                          value={item.amount}
                          onChange={(amount) => onUpdateExpense(item.id, { amount })}
                          ariaLabel={`Nominal ${safeLabel}`}
                          inputRef={(el) => {
                            amountRefs.current[item.id] = el;
                          }}
                          className="flex-1 sm:w-36 sm:flex-none"
                        />
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(item.id)}
                          aria-label={`Hapus pengeluaran ${safeLabel}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-500 dark:hover:border-red-800/80 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
