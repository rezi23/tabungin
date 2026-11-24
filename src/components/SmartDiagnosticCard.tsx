import type { FinancialAnalysis, HealthLevel } from '../types/finance';
import { formatPercent, formatRupiah } from '../utils/finance';

interface SmartDiagnosticCardProps {
  analysis: FinancialAnalysis;
}

const ACCENT_BY_LEVEL: Record<HealthLevel, { dot: string; label: string }> = {
  healthy: {
    dot: 'bg-emerald-500',
    label: 'Diagnosis: Kondisi Optimal',
  },
  warning: {
    dot: 'bg-amber-500',
    label: 'Diagnosis: Perlu Penyesuaian',
  },
  critical: {
    dot: 'bg-red-500',
    label: 'Diagnosis: Risiko Likuiditas',
  },
  unassessed: {
    dot: 'bg-zinc-400',
    label: 'Diagnosis: Menunggu Data',
  },
};

export function SmartDiagnosticCard({ analysis }: SmartDiagnosticCardProps) {
  const { diagnostic, largestExpense } = analysis;
  const accent = ACCENT_BY_LEVEL[analysis.healthLevel];

  return (
    <section
      id="analisis-pintar"
      aria-label="Analisis dan Alasan Pintar Realtime"
      data-testid="smart-diagnostic-card"
      className="fin-card overflow-hidden rounded-xl divide-y divide-zinc-200/80 dark:divide-zinc-800/80"
    >
      {/* 1. Report Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50/70 px-4 py-3 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accent.dot}`} aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            {accent.label}
          </h3>
        </div>
        <span className="font-mono text-[10px] font-medium text-zinc-500 uppercase dark:text-zinc-400">
          {analysis.mode === 'company' ? 'Evaluasi Korporasi' : 'Evaluasi Personal'}
        </span>
      </div>

      {/* 2. Primary Diagnostic Narrative */}
      <div className="p-4">
        <h4 className="text-sm font-bold leading-snug text-zinc-950 sm:text-[15px] dark:text-white">
          {diagnostic.headline}
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 sm:text-[13px] dark:text-zinc-300">
          {diagnostic.reasonSummary}
        </p>
      </div>

      {/* 3. Two-Column Impact & Bottleneck Specification */}
      <div className="grid grid-cols-1 divide-y divide-zinc-200/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-zinc-800/80">
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Konsentrasi Beban Terbesar
          </span>
          {largestExpense ? (
            <div className="mt-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-bold text-zinc-950 sm:text-[13px] dark:text-white">
                  {largestExpense.name}
                </p>
                <span className="font-mono text-xs font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                  {formatPercent(largestExpense.percentage)}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {diagnostic.largestExpenseNote}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {diagnostic.largestExpenseNote}
            </p>
          )}
        </div>

        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Simulasi Dampak 12 Bulan
          </span>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            {diagnostic.impactSimulation}
          </p>
        </div>
      </div>

      {/* 4. Actionable Recommendations Ledger */}
      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Rencana Tindakan Prioritas
        </span>
        <ol className="mt-2.5 divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {diagnostic.recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-3 py-2 first:pt-0 last:pb-0 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300"
            >
              <span className="mt-0.5 font-mono text-[11px] font-bold text-zinc-400 tabular-nums dark:text-zinc-500">
                0{index + 1}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 5. Footer Summary Bar */}
      {analysis.totalExpenses > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50/70 px-4 py-2.5 text-xs dark:bg-zinc-900/50">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            Estimasi posisi kas akhir bulan ke-12:
          </span>
          <span
            className={`font-mono text-xs font-bold tabular-nums ${
              analysis.projection[12].balance < 0
                ? 'text-red-600 dark:text-red-400'
                : analysis.netCashflow >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {formatRupiah(analysis.projection[12].balance)}
          </span>
        </div>
      )}
    </section>
  );
}
