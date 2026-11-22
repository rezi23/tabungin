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
      className="space-y-6"
    >
      {/* Mode Switcher + Utility Actions */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Pilih profil analisis</p>
            <div
              role="tablist"
              aria-label="Mode Keuangan"
              className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1"
            >
              <button
                type="button"
                role="tab"
                id="tab-personal"
                aria-selected={mode === 'personal'}
                onClick={() => onModeChange('personal')}
                className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:gap-2 sm:px-3 sm:text-sm ${
                  mode === 'personal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Mode Pribadi</span>
              </button>
              <button
                type="button"
                role="tab"
                id="tab-company"
                aria-selected={mode === 'company'}
                onClick={() => onModeChange('company')}
                className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:gap-2 sm:px-3 sm:text-sm ${
                  mode === 'company'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Mode Perusahaan</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
            <span className="text-xs text-slate-500">
              Tersimpan otomatis di browser · Data terpisah antar mode
            </span>
            <button
              type="button"
              onClick={onResetData}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 whitespace-nowrap transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset Data</span>
            </button>
          </div>

          {canUndoReset && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs text-white"
            >
              <span>Data {isCompany ? 'Perusahaan' : 'Pribadi'} telah direset ke Rp 0.</span>
              <button
                type="button"
                onClick={onUndoReset}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 font-semibold text-white whitespace-nowrap transition-colors hover:bg-white/25"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Urungkan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Cash & Income Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {isCompany ? 'Posisi Kas & Omzet Perusahaan' : 'Posisi Kas & Pendapatan'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Seluruh perhitungan dan analisis diperbarui otomatis setiap kali angka diubah.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="input-cash"
              className="block text-sm font-medium text-slate-700"
            >
              {isCompany
                ? 'Total Kas / Uang Perusahaan Saat Ini'
                : 'Total Uang di Rekening / Kas Saat Ini'}
            </label>
            <div className="mt-1.5">
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
              className="block text-sm font-medium text-slate-700"
            >
              {isCompany ? 'Pendapatan / Omzet per Bulan' : 'Pendapatan per Bulan'}
            </label>
            <div className="mt-1.5">
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

      {/* Dynamic Expenses Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              {isCompany ? 'Pengeluaran Operasional Bulanan' : 'Pengeluaran Bulanan'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {data.expenses.length} pos tercatat · Total{' '}
              <span className="font-mono font-semibold text-slate-800 tabular-nums">
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
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tambah Baris</span>
          </button>
        </div>

        {/* Quick-Add Interactive Category Buttons */}
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500">
            Tambah cepat kategori umum:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickCategories.map((category) => {
              const alreadyAdded = existingNames.has(category.toLowerCase());
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleQuickCategoryClick(category)}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    alreadyAdded
                      ? 'border-teal-200 bg-teal-50/70 text-teal-800 hover:bg-teal-100/70'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Category Quick Add Form */}
        <form
          onSubmit={handleCustomSubmit}
          className="mt-4 border-t border-slate-100 pt-4"
        >
          <label
            htmlFor="custom-expense-name"
            className="block text-xs font-medium text-slate-600"
          >
            {isCompany
              ? 'Atau tulis kategori operasional kustom:'
              : 'Atau tambah pengeluaran kustom:'}
          </label>
          <div className="mt-2 flex flex-col gap-2">
            <input
              id="custom-expense-name"
              type="text"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                if (customError) setCustomError('');
              }}
              placeholder={
                isCompany ? 'Contoh: Logistik / Pengiriman' : 'Contoh: Langganan Gym / Kafe'
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
            />
            <div className="flex gap-2">
              <CurrencyInput
                size="sm"
                value={customAmount}
                onChange={setCustomAmount}
                ariaLabel="Nominal pengeluaran baru"
                placeholder="Nominal (Rp)"
                className="flex-1"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white whitespace-nowrap transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
          {customError && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {customError}
            </p>
          )}
        </form>

        {/* Expense Items List */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          {data.expenses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-7 text-center">
              <p className="text-sm font-medium text-slate-700">
                Belum ada pengeluaran yang tercatat
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Pilih salah satu tombol kategori cepat di atas atau tulis nama pengeluaran kustom
                untuk mulai menghitung ketahanan dana.
              </p>
              <button
                type="button"
                onClick={onLoadSample}
                className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap transition-colors hover:border-teal-300 hover:bg-teal-50/60 hover:text-teal-800"
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                <span>Isi Contoh Data</span>
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100" aria-label="Daftar item pengeluaran">
              {data.expenses.map((item, idx) => {
                const share =
                  totalExpenses > 0 && item.amount > 0
                    ? (item.amount / totalExpenses) * 100
                    : 0;
                const safeLabel = item.name.trim() || `Pengeluaran #${idx + 1}`;
                return (
                  <li
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <input
                          id={`expense-name-${item.id}`}
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            onUpdateExpense(item.id, { name: e.target.value })
                          }
                          aria-label={`Nama pengeluaran ${idx + 1}`}
                          placeholder="Nama pos pengeluaran"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/15"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyInput
                          size="sm"
                          value={item.amount}
                          onChange={(amount) => onUpdateExpense(item.id, { amount })}
                          ariaLabel={`Nominal ${safeLabel}`}
                          inputRef={(el) => {
                            amountRefs.current[item.id] = el;
                          }}
                          className="flex-1 sm:w-44 sm:flex-none"
                        />
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(item.id)}
                          aria-label={`Hapus pengeluaran ${safeLabel}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    {share > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Porsi dari total pengeluaran</span>
                        <span className="font-mono font-medium text-slate-600 tabular-nums">
                          {formatPercent(share)}
                        </span>
                      </div>
                    )}
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
