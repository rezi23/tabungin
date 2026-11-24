import { useEffect, useMemo, useState } from 'react';
import { Building2, RotateCcw, Undo2, User } from 'lucide-react';
import logoImg from './assets/logo.png';
import type {
  ExpenseItem,
  FinanceMode,
  ModeFinancialData,
  TabunginStorageState,
} from './types/finance';
import { analyzeFinances, formatRupiah, formatRupiahCompact } from './utils/finance';
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
  const isCompany = activeMode === 'company';

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

  const statusDotColor =
    analysis.healthLevel === 'healthy'
      ? 'bg-emerald-500'
      : analysis.healthLevel === 'warning'
        ? 'bg-amber-500'
        : analysis.healthLevel === 'critical'
          ? 'bg-red-500'
          : 'bg-zinc-400';

  const month12Balance = analysis.projection[12]?.balance ?? analysis.cash;
  const month12Delta = analysis.projection[12]?.cumulativeChange ?? 0;

  return (
    <div className="min-h-screen bg-[#F6F6F4] text-zinc-950 dark:bg-[#09090B] dark:text-zinc-50">
      {/* Top Command Header */}
      <header className="sticky top-0 z-30 h-13 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#09090B]/90">
        <div className="mx-auto flex h-full max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6">
          {/* Brand + Inline Workspace Mode Switcher */}
          <div className="flex items-center gap-3">
            <a
              href="#top"
              className="inline-flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 dark:text-white"
            >
              <img
                src={logoImg}
                alt="Logo Tabungin"
                className="h-7 w-7 rounded-md border border-zinc-200 bg-white object-contain p-0.5 dark:border-zinc-700 dark:bg-zinc-100"
              />
              <span>Tabungin</span>
            </a>

            <span
              aria-hidden="true"
              className="hidden h-4 w-px bg-zinc-200 sm:inline-block dark:bg-zinc-800"
            />

            {/* Segmented Profile Switcher in Top Bar (Desktop/Tablet) */}
            <div
              role="tablist"
              aria-label="Profil Analisis"
              className="hidden items-center rounded-lg border border-zinc-200/90 bg-zinc-100/80 p-0.5 sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'personal'}
                onClick={() => handleModeChange('personal')}
                className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeMode === 'personal'
                    ? 'bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Pribadi</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'company'}
                onClick={() => handleModeChange('company')}
                className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeMode === 'company'
                    ? 'bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Perusahaan</span>
              </button>
            </div>
          </div>

          {/* Section Jump Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-5 text-xs font-medium text-zinc-500 lg:flex dark:text-zinc-400"
          >
            <a
              href="#input-keuangan"
              className="whitespace-nowrap transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              Buku Kas & Beban
            </a>
            <a
              href="#proyeksi-saldo"
              className="whitespace-nowrap transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              Proyeksi 12 Bulan
            </a>
            <a
              href="#ringkasan-kesehatan"
              className="whitespace-nowrap transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              Matriks Ketahanan
            </a>
            <a
              href="#analisis-pintar"
              className="whitespace-nowrap transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              Diagnosis
            </a>
          </nav>

          {/* Actions & Theme Control */}
          <div className="flex shrink-0 items-center gap-2">
            {canUndoReset ? (
              <button
                type="button"
                onClick={handleUndoReset}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500/15 px-2.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Urungkan Reset</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetData}
                title="Kosongkan data ke Rp 0"
                className="hidden h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-2.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200/90 bg-white px-2.5 text-xs font-semibold text-zinc-800 whitespace-nowrap transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Isi Contoh Data
            </button>

            <ThemeToggle theme={theme} onThemeChange={setTheme} />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="top" className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6">
        {/* Compact Workspace Title & Status Bar */}
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-base font-bold tracking-tight text-zinc-950 sm:text-lg dark:text-white">
              Analisis Kesehatan & Ketahanan Kas
            </h1>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {isCompany ? 'Profil Operasional Perusahaan' : 'Profil Keuangan Pribadi'} · Evaluasi 12 Bulan
            </span>
          </div>

          <div className="hidden items-center gap-3 text-[11px] text-zinc-500 md:flex dark:text-zinc-400">
            <span>
              Standar rasio beban: <strong className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">≤ {analysis.maxHealthyRatio}%</strong>
            </span>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>
              Target cadangan: <strong className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">≥ 6 Bulan</strong>
            </span>
          </div>
        </div>

        {/* Mobile Quick Summary Strip (visible below lg) */}
        <div className="mb-4 lg:hidden">
          <MobileQuickSummary analysis={analysis} />
        </div>

        {/* Connected 4-Column Executive KPI Ribbon (Desktop & Tablet) */}
        <div className="fin-card mb-5 hidden overflow-hidden rounded-xl lg:grid lg:grid-cols-4 lg:divide-x lg:divide-zinc-200/80 dark:lg:divide-zinc-800/80">
          {/* Metric 1: Health Status & Expense Ratio */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Status Kesehatan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor}`} />
                <span>{analysis.healthShortLabel}</span>
              </span>
            </div>
            <p className="mt-1.5 font-mono text-xl font-bold tracking-tight text-zinc-950 tabular-nums dark:text-white">
              {analysis.expenseRatio !== null ? analysis.expenseRatioLabel : 'Tanpa Omzet'}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Rasio beban dari batas ideal ≤ {analysis.maxHealthyRatio}%
            </p>
          </div>

          {/* Metric 2: Monthly Net Cashflow */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Arus Kas Bersih / Bulan
              </span>
              <span className="font-mono text-[11px] font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
                {analysis.cashflowCase === 'surplus'
                  ? 'Surplus'
                  : analysis.cashflowCase === 'deficit'
                    ? 'Defisit'
                    : 'Impas'}
              </span>
            </div>
            <p
              className={`mt-1.5 font-mono text-xl font-bold tracking-tight tabular-nums ${
                analysis.netCashflow > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : analysis.netCashflow < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-zinc-950 dark:text-white'
              }`}
            >
              {formatRupiah(analysis.netCashflow, { showSign: true })}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
              Masuk {formatRupiahCompact(analysis.income)} · Keluar {formatRupiahCompact(analysis.totalExpenses)}
            </p>
          </div>

          {/* Metric 3: Runway / Emergency Reserve */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {analysis.cashflowCase === 'deficit'
                  ? 'Ketahanan Menutup Defisit'
                  : isCompany
                    ? 'Ketahanan Kas Operasional'
                    : 'Ketahanan Dana Darurat'}
              </span>
              <span className="font-mono text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
                Target 6 Bln
              </span>
            </div>
            <p className="mt-1.5 font-mono text-xl font-bold tracking-tight text-zinc-950 tabular-nums dark:text-white">
              {analysis.cashflowCase === 'deficit'
                ? analysis.deficitRunwayLabel
                : analysis.emergencyRunwayLabel}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
              {analysis.emergencyFundGap > 0
                ? `Kurang ${formatRupiahCompact(analysis.emergencyFundGap)} ke titik aman`
                : analysis.totalExpenses > 0
                  ? `Melampaui target ${formatRupiahCompact(analysis.targetEmergencyFund)}`
                  : 'Tambahkan beban bulanan'}
            </p>
          </div>

          {/* Metric 4: 12-Month Projected Ending Balance */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Estimasi Saldo Bulan ke-12
              </span>
              <span
                className={`font-mono text-[11px] font-medium tabular-nums ${
                  month12Delta > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : month12Delta < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-zinc-500'
                }`}
              >
                {formatRupiahCompact(month12Delta)}
              </span>
            </div>
            <p
              className={`mt-1.5 font-mono text-xl font-bold tracking-tight tabular-nums ${
                month12Balance < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-zinc-950 dark:text-white'
              }`}
            >
              {formatRupiah(month12Balance)}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
              Kas awal {formatRupiahCompact(analysis.cash)}
            </p>
          </div>
        </div>

        {/* Main 2-Column Analytical Grid */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* Left Column: Financial Input Ledger */}
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

          {/* Right Column: Analytical Terminal */}
          <div className="space-y-5 lg:col-span-7">
            <CashProjectionChart analysis={analysis} isDark={theme === 'dark'} />
            <HealthSummaryCard analysis={analysis} />
            <SmartDiagnosticCard analysis={analysis} />
          </div>
        </div>
      </main>

      {/* Minimal Architectural Footer */}
      <footer className="mt-10 border-t border-zinc-200/80 bg-white/60 dark:border-zinc-800/80 dark:bg-[#09090B]">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-1.5 px-4 py-4 text-[11px] text-zinc-500 sm:flex-row sm:items-center sm:px-6 dark:text-zinc-400">
          <p>Tabungin · Seluruh data disimpan secara lokal di browser perangkat Anda.</p>
          <p className="font-mono text-[10px]">
            RASIO IDEAL ≤ {analysis.maxHealthyRatio}% · CADANGAN DARURAT ≥ 6 BULAN
          </p>
        </div>
      </footer>
    </div>
  );
}
