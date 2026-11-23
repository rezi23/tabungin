import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  CircleDashed,
  ShieldCheck,
} from 'lucide-react';
import type { FinancialAnalysis } from '../types/finance';
import { formatRupiah } from '../utils/finance';

interface MobileQuickSummaryProps {
  analysis: FinancialAnalysis;
}

export function MobileQuickSummary({ analysis }: MobileQuickSummaryProps) {
  const statusMap = {
    healthy: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-300',
      Icon: ShieldCheck,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-300',
      Icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/60 dark:border-red-800/80 dark:text-red-300',
      Icon: AlertOctagon,
    },
    unassessed: {
      bg: 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
      Icon: CircleDashed,
    },
  };

  const { bg, Icon } = statusMap[analysis.healthLevel];
  const runwayText =
    analysis.cashflowCase === 'deficit'
      ? analysis.deficitRunwayLabel
      : analysis.emergencyRunwayLabel;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:hidden dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none">
      <div className="flex items-center justify-between gap-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${bg}`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{analysis.healthShortLabel}</span>
        </div>

        <a
          href="#analisis-pintar"
          className="inline-flex h-7 items-center gap-1 text-xs font-semibold text-teal-700 whitespace-nowrap hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
        >
          <span>Lihat Analisis</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-2.5 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-2.5 dark:divide-slate-800 dark:border-slate-800">
        <div className="pr-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Arus Kas Bersih</p>
          <p
            className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${
              analysis.netCashflow > 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : analysis.netCashflow < 0
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {formatRupiah(analysis.netCashflow, { showSign: true })}
          </p>
        </div>
        <div className="pl-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {analysis.cashflowCase === 'deficit'
              ? 'Kas Bertahan'
              : analysis.mode === 'company'
                ? 'Kas Operasional'
                : 'Dana Darurat'}
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
            {runwayText}
          </p>
        </div>
      </div>
    </div>
  );
}
