import { Lightbulb } from 'lucide-react';
import type { FinancialAnalysis, HealthLevel } from '../types/finance';
import { formatPercent, formatRupiah } from '../utils/finance';

interface SmartDiagnosticCardProps {
  analysis: FinancialAnalysis;
}

const SURFACE_BY_LEVEL: Record<HealthLevel, { surface: string; border: string; iconBg: string }> = {
  healthy: {
    surface: 'bg-emerald-50/45 dark:bg-emerald-950/30',
    border: 'border-emerald-200/80 dark:border-emerald-800/60',
    iconBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300',
  },
  warning: {
    surface: 'bg-amber-50/50 dark:bg-amber-950/30',
    border: 'border-amber-200/85 dark:border-amber-800/60',
    iconBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300',
  },
  critical: {
    surface: 'bg-red-50/45 dark:bg-red-950/30',
    border: 'border-red-200/85 dark:border-red-800/60',
    iconBg: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300',
  },
  unassessed: {
    surface: 'bg-slate-50 dark:bg-slate-900/90',
    border: 'border-slate-200 dark:border-slate-800',
    iconBg: 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
};

export function SmartDiagnosticCard({ analysis }: SmartDiagnosticCardProps) {
  const { diagnostic, largestExpense } = analysis;
  const theme = SURFACE_BY_LEVEL[analysis.healthLevel];

  return (
    <section
      id="analisis-pintar"
      aria-label="Analisis dan Alasan Pintar Realtime"
      data-testid="smart-diagnostic-card"
      className={`rounded-xl border p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-8px_rgba(15,23,42,0.04)] sm:p-5 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.03] ${theme.surface} ${theme.border}`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.iconBg}`}
        >
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Analisis Pintar Realtime
          </p>
          <h3 className="mt-0.5 text-sm font-bold leading-snug text-slate-900 text-balance sm:text-[15px] dark:text-white">
            {diagnostic.headline}
          </h3>
        </div>
      </div>

      <div className="mt-3 space-y-3 text-xs leading-relaxed text-slate-700 sm:text-[13px] dark:text-slate-300">
        {/* Why this status */}
        <p>{diagnostic.reasonSummary}</p>

        {/* Largest Expense & Impact Simulation in sleek inset wells */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-900/[0.07] bg-white/70 p-3 dark:border-white/[0.06] dark:bg-slate-950/40">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pos Pengeluaran Terbesar
            </p>
            {largestExpense ? (
              <div className="mt-1">
                <p className="text-xs font-bold text-slate-900 sm:text-[13px] dark:text-white">
                  {largestExpense.name}{' '}
                  <span className="font-mono font-bold text-slate-900 tabular-nums dark:text-white">
                    ({formatPercent(largestExpense.percentage)})
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {diagnostic.largestExpenseNote}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                {diagnostic.largestExpenseNote}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-900/[0.07] bg-white/70 p-3 dark:border-white/[0.06] dark:bg-slate-950/40">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Simulasi Dampak Nyata
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
              {diagnostic.impactSimulation}
            </p>
          </div>
        </div>

        {/* Tactical Recommendations */}
        <div className="pt-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Rekomendasi Taktis ({analysis.mode === 'company' ? 'Perusahaan' : 'Pribadi'})
          </p>
          <ol className="mt-2 space-y-1.5">
            {diagnostic.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
              >
                <span className="mt-0.5 inline-flex h-4.5 min-w-[22px] shrink-0 items-center justify-center rounded bg-slate-900/10 px-1 font-mono text-[10px] font-bold text-slate-800 tabular-nums dark:bg-white/10 dark:text-slate-200">
                  0{index + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick 12-month delta summary footer line */}
        {analysis.totalExpenses > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900/10 pt-2.5 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
            <span className="font-medium">Proyeksi saldo 12 bulan ke depan:</span>
            <span
              className={`font-mono text-[13px] font-bold tabular-nums ${
                analysis.projection[12].balance < 0
                  ? 'text-red-700 dark:text-red-400'
                  : analysis.netCashflow >= 0
                    ? 'text-emerald-800 dark:text-emerald-400'
                    : 'text-amber-800 dark:text-amber-400'
              }`}
            >
              {formatRupiah(analysis.projection[12].balance)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
