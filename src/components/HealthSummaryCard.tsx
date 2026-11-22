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
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    accentText: 'text-emerald-700',
    Icon: ShieldCheck,
  },
  warning: {
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    accentText: 'text-amber-700',
    Icon: AlertTriangle,
  },
  critical: {
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-800',
    badgeBorder: 'border-red-200',
    accentText: 'text-red-700',
    Icon: AlertOctagon,
  },
  unassessed: {
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    accentText: 'text-slate-700',
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
      ? 'bg-red-600'
      : analysis.expenseRatio > analysis.maxHealthyRatio
        ? 'bg-amber-500'
        : 'bg-emerald-600';

  return (
    <section
      id="ringkasan-kesehatan"
      aria-label="Ringkasan Kesehatan Keuangan"
      data-testid="health-summary-card"
      data-health-level={analysis.healthLevel}
      className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
    >
      {/* Header Row: Title & Explicit Semantic Status Badge */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Ringkasan Realtime · {isCompany ? 'Mode Perusahaan' : 'Mode Pribadi'}
          </p>
          <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
            Kesehatan Keuangan
          </h2>
        </div>

        <div
          data-testid="health-status-badge"
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold whitespace-nowrap ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
        >
          <StatusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{analysis.healthLabel}</span>
        </div>
      </div>

      {/* Dominant Hero Metric: Net Cashflow */}
      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Arus Kas Bersih per Bulan</p>
            <div className="mt-1 flex items-center gap-2">
              <p
                data-testid="net-cashflow-value"
                className={`font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${
                  analysis.netCashflow > 0
                    ? 'text-emerald-700'
                    : analysis.netCashflow < 0
                      ? 'text-red-700'
                      : 'text-slate-900'
                }`}
              >
                {formatRupiah(analysis.netCashflow, { showSign: true })}
              </p>
              {analysis.netCashflow > 0 && (
                <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              )}
              {analysis.netCashflow < 0 && (
                <TrendingDown className="h-5 w-5 text-red-600" aria-hidden="true" />
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {analysis.cashflowStatusLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="block text-slate-500">
                {isCompany ? 'Omzet Bulanan' : 'Pendapatan'}
              </span>
              <span className="mt-0.5 block font-mono font-semibold text-slate-900 tabular-nums">
                {formatRupiah(analysis.income)}
              </span>
            </div>
            <div>
              <span className="block text-slate-500">Total Pengeluaran</span>
              <span className="mt-0.5 block font-mono font-semibold text-slate-900 tabular-nums">
                {formatRupiah(analysis.totalExpenses)}
              </span>
            </div>
            <div>
              <span className="block text-slate-500">Kas Saat Ini</span>
              <span className="mt-0.5 block font-mono font-semibold text-slate-900 tabular-nums">
                {formatRupiah(analysis.cash)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Ratio Progress Bar with Threshold Marker */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-slate-600">
              Rasio Pengeluaran terhadap {isCompany ? 'Omzet' : 'Pendapatan'}
            </span>
            <span
              data-testid="expense-ratio-value"
              className="font-mono font-semibold text-slate-900 tabular-nums"
            >
              {analysis.expenseRatioLabel}
            </span>
          </div>
          <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-200 ${barColor}`}
              style={{ width: `${clampedBarPercent}%` }}
            />
            <div
              aria-hidden="true"
              title={`Batas ideal ${analysis.maxHealthyRatio}%`}
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900/50"
              style={{ left: `${analysis.maxHealthyRatio}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>0%</span>
            <span>
              Batas sehat {isCompany ? 'perusahaan' : 'pribadi'}: ≤ {analysis.maxHealthyRatio}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Dual-Perspective Runway Grid (Hairline Separated, No Nested Cards) */}
      <div className="mt-5 grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 pt-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {/* Perspective 1: Cashflow / Deficit Runway */}
        <div className="pb-4 sm:pr-5 sm:pb-0">
          {analysis.cashflowCase === 'deficit' ? (
            <>
              <p className="text-xs font-medium text-slate-500">
                Estimasi Kas Bertahan (Menutup Defisit)
              </p>
              <p
                data-testid="primary-runway-value"
                className="mt-1 font-mono text-xl font-bold text-red-700 tabular-nums"
              >
                {analysis.deficitRunwayLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Defisit (burn rate){' '}
                <span className="font-mono font-semibold text-slate-700 tabular-nums">
                  {formatRupiah(analysis.burnRate)}/bln
                </span>
              </p>
            </>
          ) : analysis.cashflowCase === 'no_expenses' ? (
            <>
              <p className="text-xs font-medium text-slate-500">Status Ketahanan Dana</p>
              <p
                data-testid="primary-runway-value"
                className="mt-1 text-base font-semibold text-slate-700"
              >
                Belum ada pengeluaran tercatat
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tambahkan minimal satu pengeluaran untuk menghitung runway kas.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-500">Status Arus Kas Bulanan</p>
              <p
                data-testid="primary-runway-value"
                className={`mt-1 text-base font-bold leading-snug sm:text-lg ${
                  analysis.cashflowCase === 'surplus' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {analysis.cashflowCase === 'surplus' ? 'Bertumbuh ' : 'Impas '}
                <span className="font-mono whitespace-nowrap tabular-nums">
                  ({formatRupiah(analysis.netCashflow, { showSign: true })} / bulan)
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {analysis.cashflowCase === 'surplus'
                  ? 'Kas tidak tergerus selama arus kas tetap positif.'
                  : 'Pendapatan persis sama dengan total pengeluaran.'}
              </p>
            </>
          )}
        </div>

        {/* Perspective 2: Emergency Runway (Zero Income Scenario) */}
        <div className="pt-4 sm:pt-0 sm:pl-5">
          <p className="text-xs font-medium text-slate-500">
            Ketahanan {isCompany ? 'Kas Operasional' : 'Dana Darurat'} (Jika Tanpa Pemasukan)
          </p>
          <p
            data-testid="emergency-runway-value"
            className={`mt-1 font-mono text-xl font-bold tabular-nums ${
              analysis.emergencyRunwayMonths === null
                ? 'text-slate-600'
                : analysis.emergencyRunwayMonths >= 6
                  ? 'text-emerald-700'
                  : analysis.emergencyRunwayMonths >= 3
                    ? 'text-amber-700'
                    : 'text-red-700'
            }`}
          >
            {analysis.emergencyRunwayLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {analysis.totalExpenses > 0 ? (
              <>
                Target ideal 6 bulan:{' '}
                <span className="font-mono font-semibold text-slate-700 tabular-nums">
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
