import { useEffect, useMemo, useState } from 'react';
import logoImg from './assets/logo.png';
import type {
  ExpenseItem,
  FinanceMode,
  ModeFinancialData,
  TabunginStorageState,
} from './types/finance';
import { analyzeFinances } from './utils/finance';
import { getEmptyData, getSampleData } from './utils/presets';
import { getInitialStorageState, saveStorageState } from './utils/storage';
import { FinanceInputPanel } from './components/FinanceInputPanel';
import { HealthSummaryCard } from './components/HealthSummaryCard';
import { SmartDiagnosticCard } from './components/SmartDiagnosticCard';
import { CashProjectionChart } from './components/CashProjectionChart';
import { MobileQuickSummary } from './components/MobileQuickSummary';

export default function App() {
  const [state, setState] = useState<TabunginStorageState>(() => getInitialStorageState());
  const [undoSnapshot, setUndoSnapshot] = useState<{
    mode: FinanceMode;
    data: ModeFinancialData;
  } | null>(null);

  useEffect(() => {
    saveStorageState(state);
  }, [state]);

  const activeMode = state.activeMode;
  const activeData = state[activeMode];

  const analysis = useMemo(
    () => analyzeFinances(activeMode, activeData),
    [activeMode, activeData]
  );

  const updateActiveModeData = (
    updater: (prev: ModeFinancialData) => ModeFinancialData
  ) => {
    setUndoSnapshot(null);
    setState((prev) => ({
      ...prev,
      [prev.activeMode]: updater(prev[prev.activeMode]),
    }));
  };

  const handleModeChange = (nextMode: FinanceMode) => {
    setUndoSnapshot(null);
    setState((prev) => ({
      ...prev,
      activeMode: nextMode,
    }));
  };

  const handleUpdateCash = (cash: number) => {
    updateActiveModeData((prev) => ({ ...prev, cash }));
  };

  const handleUpdateIncome = (income: number) => {
    updateActiveModeData((prev) => ({ ...prev, income }));
  };

  const handleAddExpense = (name: string, amount = 0): string => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    updateActiveModeData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { id, name, amount }],
    }));
    return id;
  };

  const handleUpdateExpense = (
    id: string,
    patch: Partial<Omit<ExpenseItem, 'id'>>
  ) => {
    updateActiveModeData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  };

  const handleDeleteExpense = (id: string) => {
    updateActiveModeData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((item) => item.id !== id),
    }));
  };

  const handleLoadSample = () => {
    setUndoSnapshot(null);
    setState((prev) => ({
      ...prev,
      [prev.activeMode]: getSampleData(prev.activeMode),
    }));
  };

  const handleResetData = () => {
    setUndoSnapshot({
      mode: activeMode,
      data: activeData,
    });
    setState((prev) => ({
      ...prev,
      [prev.activeMode]: getEmptyData(),
    }));
  };

  const handleUndoReset = () => {
    if (!undoSnapshot) return;
    setState((prev) => ({
      ...prev,
      activeMode: undoSnapshot.mode,
      [undoSnapshot.mode]: undoSnapshot.data,
    }));
    setUndoSnapshot(null);
  };

  const canUndoReset = undoSnapshot !== null && undoSnapshot.mode === activeMode;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sticky Top Header (Strict 3-Zone Contract, <= 56px height on mobile) */}
      <header className="sticky top-0 z-30 h-14 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <img
              src={logoImg}
              alt="Logo Tabungin"
              className="h-9 w-9 rounded-lg border border-slate-200/80 bg-white object-contain p-0.5 shadow-2xs"
            />
            <span>Tabungin</span>
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
          >
            <a
              href="#input-keuangan"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Input Data
            </a>
            <a
              href="#ringkasan-kesehatan"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Ringkasan
            </a>
            <a
              href="#analisis-pintar"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Analisis Pintar
            </a>
            <a
              href="#proyeksi-saldo"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Proyeksi 12 Bulan
            </a>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex min-h-[38px] items-center justify-center rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Isi Contoh Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="top" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Compact Workspace Title Row */}
        <div className="mb-6 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
            Kalkulator & Analisis Kesehatan Keuangan
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Pantau arus kas bersih, ketahanan dana darurat, dan proyeksi saldo 12 bulan ke depan
            secara realtime untuk keuangan pribadi maupun operasional perusahaan.
          </p>
        </div>

        {/* Mobile Quick Summary Strip (visible only below lg breakpoint) */}
        <div className="mb-5 lg:hidden">
          <MobileQuickSummary analysis={analysis} />
        </div>

        {/* Responsive 2-Column Desktop / Stacked Mobile Grid */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Mode Switcher & Dynamic Financial Form */}
          <div className="lg:col-span-5">
            <FinanceInputPanel
              mode={activeMode}
              data={activeData}
              totalExpenses={analysis.totalExpenses}
              canUndoReset={canUndoReset}
              onModeChange={handleModeChange}
              onUpdateCash={handleUpdateCash}
              onUpdateIncome={handleUpdateIncome}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onLoadSample={handleLoadSample}
              onResetData={handleResetData}
              onUndoReset={handleUndoReset}
            />
          </div>

          {/* Right Column (Sticky on Desktop): Summary, Smart Diagnostic & 12-Month Chart */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:col-span-7">
            <HealthSummaryCard analysis={analysis} />
            <SmartDiagnosticCard analysis={analysis} />
            <CashProjectionChart analysis={analysis} />
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            Tabungin · Seluruh perhitungan dilakukan secara lokal di perangkat Anda.
          </p>
          <p>
            Standar evaluasi: rasio sehat ≤ 80% (Pribadi) / ≤ 85% (Perusahaan) & ketahanan kas ≥ 6
            bulan.
          </p>
        </div>
      </footer>
    </div>
  );
}
