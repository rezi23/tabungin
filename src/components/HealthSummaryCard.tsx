import {
  AlertOctagon,
  AlertTriangle,
  CircleDashed,
  ShieldCheck,
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
    dotColor: string;
    Icon: typeof ShieldCheck;
  }
> = {
  healthy: {
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    badgeBorder: 'border-emerald-500/25 dark:border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    Icon: ShieldCheck,
  },
  warning: {
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-500/25 dark:border-amber-500/30',
    dotColor: 'bg-amber-500',
    Icon: AlertTriangle,
  },
  critical: {
    badgeBg: 'bg-red-500/10 dark:bg-red-500/15',
    badgeText: 'text-red-800 dark:text-red-300',
    badgeBorder: 'border-red-500/25 dark:border-red-500/30',
    dotColor: 'bg-red-500',
    Icon: AlertOctagon,
  },
  unassessed: {
    badgeBg: 'bg-zinc-100 dark:bg-zinc-800',
    badgeText: 'text-zinc-700 dark:text-zinc-300',
    badgeBorder: 'border-zinc-200 dark:border-zinc-700',
    dotColor: 'bg-zinc-400',
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
      className="fin-card overflow-hidden rounded-xl divide-y divide-zinc-200/80 dark:divide-zinc-800/80"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50/70 px-4 py-3 dark:bg-zinc-900/50">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Matriks Ketahanan & Rasio Kas
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Parameter kesehatan berdasarkan rasio pengeluaran dan cadangan likuid
          </p>
        </div>

        <div
          data-testid="health-status-badge"
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
        >
          <StatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{analysis.healthLabel}</span>
        </div>
      </div>

      {/* 2. Net Cashflow & Ratio Gauge */}
      <div className="p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Arus Kas Bersih Bulanan
            </span>
            <p
              data-testid="net-cashflow-value"
              className={`mt-0.5 font-mono text-2xl font-bold tracking-tight tabular-nums ${
                analysis.netCashflow > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : analysis.netCashflow < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-zinc-950 dark:text-white'
              }`}
            >
              {formatRupiah(analysis.netCashflow, { showSign: true })}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {analysis.cashflowStatusLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-100 pt-2.5 text-xs sm:border-t-0 sm:pt-0 dark:border-zinc-800/80">
            <div>
              <span className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {isCompany ? 'Omzet / Bln' : 'Pendapatan / Bln'}
              </span>
              <span className="mt-0.5 block font-mono font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
                {formatRupiah(analysis.income)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                Total Beban / Bln
              </span>
              <span className="mt-0.5 block font-mono font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
                {formatRupiah(analysis.totalExpenses)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                Saldo Kas Likuid
              </span>
              <span className="mt-0.5 block font-mono font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
                {formatRupiah(analysis.cash)}
              </span>
            </div>
          </div>
        </div>

        {/* Precision Ratio Bar */}
        <div className="mt-4 border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Rasio Pengeluaran terhadap {isCompany ? 'Omzet' : 'Pendapatan'}
            </span>
            <span
              data-testid="expense-ratio-value"
              className="font-mono font-bold text-zinc-950 tabular-nums dark:text-white"
            >
              {analysis.expenseRatioLabel}
            </span>
          </div>
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-200 ${barColor}`}
              style={{ width: `${clampedBarPercent}%` }}
            />
            <div
              aria-hidden="true"
              title={`Batas ideal ${analysis.maxHealthyRatio}%`}
              className="absolute top-0 bottom-0 w-0.5 bg-zinc-950 dark:bg-white"
              style={{ left: `${analysis.maxHealthyRatio}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>0%</span>
            <span>AMBANG SEHAT ≤ {analysis.maxHealthyRatio}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 3. Dual-Perspective Runway Specification Grid */}
      <div className="grid grid-cols-1 divide-y divide-zinc-200/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-zinc-800/80">
        {/* Perspective 1: Ongoing Cashflow Runway */}
        <div className="p-4">
          {analysis.cashflowCase === 'deficit' ? (
            <>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Runway Kas (Menutup Defisit Berjalan)
              </span>
              <p
                data-testid="primary-runway-value"
                className="mt-1 font-mono text-lg font-bold text-red-600 tabular-nums dark:text-red-400"
              >
                {analysis.deficitRunwayLabel}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                Penggerusan kas{' '}
                <span className="font-mono font-semibold text-zinc-800 tabular-nums dark:text-zinc-200">
                  {formatRupiah(analysis.burnRate)}/bln
                </span>
              </p>
            </>
          ) : analysis.cashflowCase === 'no_expenses' ? (
            <>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Status Ketahanan Kas
              </span>
              <p
                data-testid="primary-runway-value"
                className="mt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Belum ada pengeluaran tercatat
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                Tambahkan pos biaya untuk menghitung ketahanan dana.
              </p>
            </>
          ) : (
            <>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Skenario Arus Kas Berjalan
              </span>
              <p
                data-testid="primary-runway-value"
                className={`mt-1 text-sm font-bold leading-snug ${
                  analysis.cashflowCase === 'surplus'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {analysis.cashflowCase === 'surplus' ? 'Bertumbuh ' : 'Impas '}
                <span className="font-mono whitespace-nowrap tabular-nums">
                  ({formatRupiah(analysis.netCashflow, { showSign: true })}/bln)
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                {analysis.cashflowCase === 'surplus'
                  ? 'Saldo kas terus bertambah setiap bulan.'
                  : 'Pemasukan sama persis dengan pengeluaran.'}
              </p>
            </>
          )}
        </div>

        {/* Perspective 2: Zero-Income Emergency Reserve */}
        <div className="p-4">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Ketahanan {isCompany ? 'Kas Operasional' : 'Dana Darurat'} (Jika Pemasukan Rp 0)
          </span>
          <p
            data-testid="emergency-runway-value"
            className={`mt-1 font-mono text-lg font-bold tabular-nums ${
              analysis.emergencyRunwayMonths === null
                ? 'text-zinc-600 dark:text-zinc-400'
                : analysis.emergencyRunwayMonths >= 6
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : analysis.emergencyRunwayMonths >= 3
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
            }`}
          >
            {analysis.emergencyRunwayLabel}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {analysis.totalExpenses > 0 ? (
              <>
                Target standar 6 bln:{' '}
                <span className="font-mono font-semibold text-zinc-800 tabular-nums dark:text-zinc-200">
                  {formatRupiah(analysis.targetEmergencyFund)}
                </span>
              </>
            ) : (
              'Otomatis dihitung setelah pengeluaran diisi.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
