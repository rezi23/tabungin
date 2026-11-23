import {
  AlertOctagon,
  AlertTriangle,
  CircleDashed,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { FinancialAnalysis, HealthLevel } from '../types/finance';
import { formatRupiah } from '../utils/finance';

interface HealthSummaryCardProps {
  analysis: FinancialAnalysis;
}

const STATUS_STYLES: Record<
  HealthLevel,
  {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    accentText: string;
    Icon: typeof ShieldCheck;
  }
> = {
  healthy: {
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800/80',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    Icon: ShieldCheck,
  },
  warning: {
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800/80',
    accentText: 'text-amber-700 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  critical: {
    badgeBg: 'bg-red-50 dark:bg-red-950/60',
    badgeText: 'text-red-800 dark:text-red-300',
    badgeBorder: 'border-red-200 dark:border-red-800/80',
    accentText: 'text-red-700 dark:text-red-400',
    Icon: AlertOctagon,
  },
  unassessed: {
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    accentText: 'text-slate-700 dark:text-slate-300',
    Icon: CircleDashed,
  },
};

export function HealthSummaryCard({ analysis }: HealthSummaryCardProps) {
  const style = STATUS_STYLES[analysis.healthLevel];
  const StatusIcon = style.Icon;
  const isCompany = analysis.mode === 'company';

  const clampedBarPercent =
    analysis.expenseRatio === null ? 100 : Math.min(100, Math.max(0, analysis.expenseRatio));

  const barColor =
    analysis.expenseRatio === null || analysis.expenseRatio > 100
      ? 'bg-red-600 dark:bg-red-500'
      : analysis.expenseRatio > analysis.maxHealthyRatio
        ? 'bg-amber-500 dark:bg-amber-400'
        : 'bg-emerald-600 dark:bg-emerald-500';

  return (
    <section
      id="ringkasan-kesehatan"
      aria-label="Ringkasan Kesehatan Keuangan"
      data-testid="health-summary-card"
      data-health-level={analysis.healthLevel}
      className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-8px_rgba(15,23,42,0.05)] sm:p-5 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.03]"
    >
      {/* Header Row: Title & Explicit Semantic Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
            Kesehatan Keuangan
          </h2>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            · {isCompany ? 'Perusahaan' : 'Pribadi'}
          </span>
        </div>

        <div
          data-testid="health-status-badge"
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
        >
          <StatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{analysis.healthLabel}</span>
        </div>
      </div>

      {/* Dominant Hero Metric: Net Cashflow + Crisp 3-Stat Strip */}
      <div className="mt-3.5 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Arus Kas Bersih / Bulan
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p
                data-testid="net-cashflow-value"
                className={`font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-[28px] ${
                  analysis.netCashflow > 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : analysis.netCashflow < 0
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-slate-900 dark:text-white'
                }`}
              >
                {formatRupiah(analysis.netCashflow, { showSign: true })}
              </p>
              {analysis.netCashflow > 0 && (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              )}
              {analysis.netCashflow < 0 && (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {analysis.cashflowStatusLabel}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/80 px-2.5 py-1.5 dark:border-slate-800/90 dark:bg-slate-950/60">
              <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {isCompany ? 'Omzet' : 'Pendapatan'}
              </span>
              <span className="mt-0.5 block font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {formatRupiah(analysis.income)}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/80 px-2.5 py-1.5 dark:border-slate-800/90 dark:bg-slate-950/60">
              <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Pengeluaran
              </span>
              <span className="mt-0.5 block font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {formatRupiah(analysis.totalExpenses)}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/80 px-2.5 py-1.5 dark:border-slate-800/90 dark:bg-slate-950/60">
              <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Kas Saat Ini
              </span>
              <span className="mt-0.5 block font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {formatRupiah(analysis.cash)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Ratio Progress Bar with Threshold Marker */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Rasio Pengeluaran terhadap {isCompany ? 'Omzet' : 'Pendapatan'}
            </span>
            <span
              data-testid="expense-ratio-value"
              className="font-mono font-bold text-slate-900 tabular-nums dark:text-white"
            >
              {analysis.expenseRatioLabel}
            </span>
          </div>
          <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-200 ${barColor}`}
              style={{ width: `${clampedBarPercent}%` }}
            />
            <div
              aria-hidden="true"
              title={`Batas ideal ${analysis.maxHealthyRatio}%`}
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 dark:bg-white/70"
              style={{ left: `${analysis.maxHealthyRatio}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>0%</span>
            <span>
              Batas sehat {isCompany ? 'perusahaan' : 'pribadi'}: ≤ {analysis.maxHealthyRatio}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Dual-Perspective Runway Grid (Compact Hairline Separated) */}
      <div className="mt-3.5 grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 pt-3.5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-slate-800/80 dark:border-slate-800/80">
        {/* Perspective 1: Cashflow / Deficit Runway */}
        <div className="pb-3 sm:pr-4 sm:pb-0">
          {analysis.cashflowCase === 'deficit' ? (
            <>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Estimasi Kas Bertahan (Menutup Defisit)
              </p>
              <p
                data-testid="primary-runway-value"
                className="mt-0.5 font-mono text-lg font-bold text-red-700 tabular-nums dark:text-red-400"
              >
                {analysis.deficitRunwayLabel}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Burn rate{' '}
                <span className="font-mono font-semibold text-slate-700 tabular-nums dark:text-slate-200">
                  {formatRupiah(analysis.burnRate)}/bln
                </span>
              </p>
            </>
          ) : analysis.cashflowCase === 'no_expenses' ? (
            <>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Status Ketahanan Dana</p>
              <p
                data-testid="primary-runway-value"
                className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Belum ada pengeluaran tercatat
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Tambahkan minimal satu pos untuk menghitung runway kas.
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Status Arus Kas Bulanan</p>
              <p
                data-testid="primary-runway-value"
                className={`mt-0.5 text-sm font-bold leading-snug sm:text-[15px] ${
                  analysis.cashflowCase === 'surplus'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {analysis.cashflowCase === 'surplus' ? 'Bertumbuh ' : 'Impas '}
                <span className="font-mono whitespace-nowrap tabular-nums">
                  ({formatRupiah(analysis.netCashflow, { showSign: true })}/bln)
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {analysis.cashflowCase === 'surplus'
                  ? 'Kas tidak tergerus selama arus kas positif.'
                  : 'Pendapatan persis sama dengan pengeluaran.'}
              </p>
            </>
          )}
        </div>

        {/* Perspective 2: Emergency Runway (Zero Income Scenario) */}
        <div className="pt-3 sm:pt-0 sm:pl-4">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Ketahanan {isCompany ? 'Kas Operasional' : 'Dana Darurat'} (Tanpa Pemasukan)
          </p>
          <p
            data-testid="emergency-runway-value"
            className={`mt-0.5 font-mono text-lg font-bold tabular-nums ${
              analysis.emergencyRunwayMonths === null
                ? 'text-slate-600 dark:text-slate-400'
                : analysis.emergencyRunwayMonths >= 6
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : analysis.emergencyRunwayMonths >= 3
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-red-700 dark:text-red-400'
            }`}
          >
            {analysis.emergencyRunwayLabel}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {analysis.totalExpenses > 0 ? (
              <>
                Target 6 bulan:{' '}
                <span className="font-mono font-semibold text-slate-700 tabular-nums dark:text-slate-200">
                  {formatRupiah(analysis.targetEmergencyFund)}
                </span>
              </>
            ) : (
              'Otomatis terhitung setelah pengeluaran diisi.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
