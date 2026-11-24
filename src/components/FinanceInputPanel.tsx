import React, { useRef, useState } from 'react';
import {
  Building2,
  Check,
  Plus,
  RotateCcw,
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
    const existing = data.expenses.find(
      (item) => item.name.trim().toLowerCase() === categoryName.toLowerCase()
    );
    if (existing) {
      amountRefs.current[existing.id]?.focus();
      return;
    }
    const newId = onAddExpense(categoryName, 0);
    window.requestAnimationFrame(() => {
      amountRefs.current[newId]?.focus();
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) {
      setCustomError('Masukkan nama pos pengeluaran terlebih dahulu.');
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
      className="fin-card overflow-hidden rounded-xl divide-y divide-zinc-200/80 dark:divide-zinc-800/80"
    >
      {/* 1. Ledger Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50/70 px-4 py-3 dark:bg-zinc-900/50">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Buku Kas & Komponen Biaya
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Data tersimpan otomatis & terpisah antar profil
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            role="tablist"
            aria-label="Mode Keuangan"
            className="inline-flex rounded-lg border border-zinc-200/90 bg-zinc-200/50 p-0.5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <button
              type="button"
              role="tab"
              id="tab-personal"
              aria-selected={mode === 'personal'}
              onClick={() => onModeChange('personal')}
              className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                mode === 'personal'
                  ? 'bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Pribadi</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-company"
              aria-selected={mode === 'company'}
              onClick={() => onModeChange('company')}
              className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                mode === 'company'
                  ? 'bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Perusahaan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onResetData}
            title="Reset data profil ini ke Rp 0"
            aria-label="Reset Data"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200/90 bg-white text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Undo Reset Notification Strip */}
      {canUndoReset && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 bg-zinc-900 px-4 py-2 text-xs text-white dark:bg-zinc-800"
        >
          <span>Data {isCompany ? 'Perusahaan' : 'Pribadi'} telah direset ke Rp 0.</span>
          <button
            type="button"
            onClick={onUndoReset}
            className="inline-flex h-6 cursor-pointer items-center gap-1 rounded bg-white/15 px-2 text-[11px] font-semibold text-white hover:bg-white/25"
          >
            <Undo2 className="h-3 w-3" aria-hidden="true" />
            <span>Urungkan</span>
          </button>
        </div>
      )}

      {/* 2. Primary Cash & Monthly Income Split Grid */}
      <div className="grid grid-cols-1 divide-y divide-zinc-200/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-zinc-800/80">
        <div className="p-4">
          <label
            htmlFor="input-cash"
            className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200"
          >
            {isCompany ? 'Total Kas Perusahaan' : 'Total Kas / Saldo Saat Ini'}
          </label>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Dana likuid yang siap digunakan
          </p>
          <div className="mt-2.5">
            <CurrencyInput
              id="input-cash"
              value={data.cash}
              onChange={onUpdateCash}
              placeholder="0"
            />
          </div>
        </div>

        <div className="p-4">
          <label
            htmlFor="input-income"
            className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200"
          >
            {isCompany ? 'Omzet Bersih / Bulan' : 'Pendapatan / Bulan'}
          </label>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Pemasukan rutin setiap bulan
          </p>
          <div className="mt-2.5">
            <CurrencyInput
              id="input-income"
              value={data.income}
              onChange={onUpdateIncome}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* 3. Monthly Expense Ledger */}
      <div>
        {/* Expense Section Subheader */}
        <div className="flex items-center justify-between gap-2 bg-zinc-50/50 px-4 py-2.5 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {isCompany ? 'Beban Operasional Bulanan' : 'Pos Pengeluaran Bulanan'}
            </h3>
            <span className="rounded bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-700 tabular-nums dark:bg-zinc-800 dark:text-zinc-300">
              {data.expenses.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total: </span>
            <span className="font-mono text-xs font-bold text-zinc-950 tabular-nums dark:text-white">
              {formatRupiah(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Quick-Add Category Chips */}
        <div className="border-t border-zinc-200/60 px-4 py-2.5 dark:border-zinc-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            {quickCategories.map((category) => {
              const alreadyAdded = existingNames.has(category.toLowerCase());
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleQuickCategoryClick(category)}
                  className={`inline-flex h-6.5 cursor-pointer items-center gap-1 rounded-md border px-2 text-[11px] font-medium whitespace-nowrap transition-colors ${
                    alreadyAdded
                      ? 'border-zinc-900/20 bg-zinc-900 text-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'border-zinc-200/90 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {alreadyAdded ? (
                    <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <Plus className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
                  )}
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ledger Line Items */}
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80">
          {data.expenses.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Belum ada pos pengeluaran tercatat
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Pilih kategori cepat di atas atau tambahkan pos baru pada baris di bawah.
              </p>
              <button
                type="button"
                onClick={onLoadSample}
                className="mt-3 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span>Muat Contoh Data</span>
              </button>
            </div>
          ) : (
            <ul
              className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60"
              aria-label="Daftar item pengeluaran"
            >
              {data.expenses.map((item, idx) => {
                const share =
                  totalExpenses > 0 && item.amount > 0
                    ? (item.amount / totalExpenses) * 100
                    : 0;
                const safeLabel = item.name.trim() || `Pengeluaran #${idx + 1}`;
                return (
                  <li
                    key={item.id}
                    className="group relative px-4 py-2 transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-2">
                      {/* Index Number */}
                      <span className="w-5 shrink-0 font-mono text-[10px] font-medium text-zinc-400 tabular-nums dark:text-zinc-500">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Inline Editable Category Name */}
                      <div className="min-w-0 flex-1">
                        <input
                          id={`expense-name-${item.id}`}
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            onUpdateExpense(item.id, { name: e.target.value })
                          }
                          aria-label={`Nama pengeluaran ${idx + 1}`}
                          placeholder="Nama pos biaya..."
                          className="h-8.5 w-full rounded-md border border-transparent bg-transparent px-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 transition-colors hover:border-zinc-200/80 focus:border-zinc-900 focus:bg-white focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-800 dark:focus:border-zinc-400 dark:focus:bg-zinc-950"
                        />
                      </div>

                      {/* Share Percentage Badge */}
                      <span
                        title="Porsi dari total pengeluaran"
                        className="hidden w-11 shrink-0 text-right font-mono text-[11px] text-zinc-400 tabular-nums sm:inline-block dark:text-zinc-500"
                      >
                        {share > 0 ? formatPercent(share, 0) : '0%'}
                      </span>

                      {/* Amount Input */}
                      <CurrencyInput
                        size="sm"
                        value={item.amount}
                        onChange={(amount) => onUpdateExpense(item.id, { amount })}
                        ariaLabel={`Nominal ${safeLabel}`}
                        inputRef={(el) => {
                          amountRefs.current[item.id] = el;
                        }}
                        className="w-34 shrink-0 sm:w-38"
                      />

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(item.id)}
                        aria-label={`Hapus pengeluaran ${safeLabel}`}
                        className="flex h-8.5 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 4. Built-in Footer Row: Add New Expense Item */}
        <form
          onSubmit={handleCustomSubmit}
          className="border-t border-zinc-200/80 bg-zinc-50/70 px-4 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/40"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <input
                id="custom-expense-name"
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  if (customError) setCustomError('');
                }}
                aria-label="Nama pos pengeluaran baru"
                placeholder={
                  isCompany
                    ? '+ Tambah pos operasional baru (mis. Logistik)...'
                    : '+ Tambah pos pengeluaran baru (mis. Langganan)...'
                }
                className="h-8.5 w-full rounded-lg border border-zinc-200/90 bg-white px-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <CurrencyInput
                size="sm"
                value={customAmount}
                onChange={setCustomAmount}
                ariaLabel="Nominal pengeluaran baru"
                placeholder="0"
                className="flex-1 sm:w-34 sm:flex-none"
              />
              <button
                type="submit"
                className="inline-flex h-8.5 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg bg-zinc-900 px-3 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
          {customError && (
            <p role="alert" className="mt-1.5 text-[11px] font-medium text-red-600 dark:text-red-400">
              {customError}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
