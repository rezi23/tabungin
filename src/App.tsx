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
import { getInitialTheme, ThemeToggle, type ThemeMode } from './components/ThemeToggle';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
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
    <div className="relative min-h-screen bg-[#F6F8FA] text-slate-900 dark:bg-[#050811] dark:text-slate-100">
      {/* Subtle Ambient Executive Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(15,118,110,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
      />

      {/* Sticky Top Header (Sleek, Compact Executive Bar) */}
      <header className="sticky top-0 z-30 h-13 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="mx-auto flex h-full max-w-[1380px] items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-white"
          >
            <img
              src={logoImg}
              alt="Logo Tabungin"
              className="h-8 w-8 rounded-lg border border-slate-200/90 bg-white object-contain p-0.5 shadow-2xs dark:border-slate-700/80 dark:bg-slate-100"
            />
            <span>Tabungin</span>
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-5 text-xs font-medium text-slate-600 md:flex dark:text-slate-400"
          >
            <a
              href="#input-keuangan"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              Input Data
            </a>
            <a
              href="#ringkasan-kesehatan"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              Ringkasan
            </a>
            <a
              href="#analisis-pintar"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              Analisis Pintar
            </a>
            <a
              href="#proyeksi-saldo"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              Proyeksi 12 Bulan
            </a>
          </nav>

          {/* Zone 3: Theme Switcher & Primary Action */}
          <div className="flex shrink-0 items-center gap-2.5">
            <ThemeToggle theme={theme} onThemeChange={setTheme} />
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white whitespace-nowrap shrink-0 shadow-xs transition-all hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Isi Contoh Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="top" className="relative mx-auto max-w-[1380px] px-4 py-4 sm:px-6 sm:py-5">
        {/* Compact Executive Header Row */}
        <div className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-200/70 pb-3.5 sm:flex-row sm:items-end dark:border-slate-800/80">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
              Kalkulator & Analisis Kesehatan Keuangan
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Pantau arus kas bersih, ketahanan dana darurat, dan proyeksi saldo 12 bulan secara realtime.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-[11px] font-medium text-slate-500 lg:flex dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Perhitungan Lokal Realtime</span>
            </span>
          </div>
        </div>

        {/* Mobile Quick Summary Strip (visible only below lg breakpoint) */}
        <div className="mb-4 lg:hidden">
          <MobileQuickSummary analysis={analysis} />
        </div>

        {/* Dense 2-Column Executive Desktop / Stacked Mobile Grid */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
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
          <div className="space-y-4 lg:sticky lg:top-[68px] lg:col-span-7">
            <HealthSummaryCard analysis={analysis} />
            <SmartDiagnosticCard analysis={analysis} />
            <CashProjectionChart analysis={analysis} isDark={theme === 'dark'} />
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="mt-8 border-t border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-[1380px] flex-col items-start justify-between gap-1.5 px-4 py-3.5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:px-6 dark:text-slate-400">
          <p>
            Tabungin · Seluruh perhitungan dilakukan secara lokal di perangkat Anda.
          </p>
          <p>
            Standar evaluasi: rasio sehat ≤ 80% (Pribadi) / ≤ 85% (Perusahaan) & ketahanan kas ≥ 6 bulan.
          </p>
        </div>
      </footer>
    </div>
  );
}
