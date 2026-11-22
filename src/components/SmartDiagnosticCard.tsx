import { Lightbulb } from 'lucide-react';
import type { FinancialAnalysis, HealthLevel } from '../types/finance';
import { formatPercent, formatRupiah } from '../utils/finance';

interface SmartDiagnosticCardProps {
  analysis: FinancialAnalysis;
}

const SURFACE_BY_LEVEL: Record<HealthLevel, { surface: string; border: string; iconBg: string }> = {
  healthy: {
    surface: 'bg-emerald-50/45',
    border: 'border-emerald-200/80',
    iconBg: 'bg-emerald-100 text-emerald-800',
  },
  warning: {
    surface: 'bg-amber-50/50',
    border: 'border-amber-200/85',
    iconBg: 'bg-amber-100 text-amber-800',
  },
  critical: {
    surface: 'bg-red-50/45',
    border: 'border-red-200/85',
    iconBg: 'bg-red-100 text-red-800',
  },
  unassessed: {
    surface: 'bg-slate-50',
    border: 'border-slate-200',
    iconBg: 'bg-slate-200/80 text-slate-700',
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
      className={`rounded-2xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6 ${theme.surface} ${theme.border}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.iconBg}`}
        >
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-600">
            Analisis & Alasan Pintar Realtime
          </p>
          <h3 className="mt-0.5 text-base font-bold leading-snug text-slate-900 text-balance">
            {diagnostic.headline}
          </h3>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">
        {/* Why this status */}
        <p>{diagnostic.reasonSummary}</p>

        {/* Largest Expense & Impact Simulation */}
        <div className="grid grid-cols-1 gap-4 border-y border-slate-900/10 py-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-900">Pos Pengeluaran Terbesar</p>
            {largestExpense ? (
              <div className="mt-1">
                <p className="text-sm font-semibold text-slate-900">
                  {largestExpense.name}{' '}
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ({formatPercent(largestExpense.percentage)})
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {diagnostic.largestExpenseNote}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-600">{diagnostic.largestExpenseNote}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-900">Simulasi Dampak Nyata</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              {diagnostic.impactSimulation}
            </p>
          </div>
        </div>

        {/* Tactical Recommendations */}
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Rekomendasi Taktis ({analysis.mode === 'company' ? 'Mode Perusahaan' : 'Mode Pribadi'})
          </p>
          <ol className="mt-2.5 space-y-2">
            {diagnostic.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700 sm:text-[13px]">
                <span className="mt-0.5 font-mono text-xs font-bold text-slate-900 tabular-nums">
                  0{index + 1}.
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick 12-month delta summary footer line */}
        {analysis.totalExpenses > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900/10 pt-3 text-xs text-slate-600">
            <span>Proyeksi saldo 12 bulan ke depan:</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                analysis.projection[12].balance < 0
                  ? 'text-red-700'
                  : analysis.netCashflow >= 0
                    ? 'text-emerald-800'
                    : 'text-amber-800'
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
