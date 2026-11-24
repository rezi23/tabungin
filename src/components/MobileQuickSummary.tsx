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
      bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300',
      Icon: ShieldCheck,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/25 text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300',
      Icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-red-500/10 border-red-500/25 text-red-800 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-300',
      Icon: AlertOctagon,
    },
    unassessed: {
      bg: 'bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300',
      Icon: CircleDashed,
    },
  };

  const { bg, Icon } = statusMap[analysis.healthLevel];
  const runwayText =
    analysis.cashflowCase === 'deficit'
      ? analysis.deficitRunwayLabel
      : analysis.emergencyRunwayLabel;

  return (
    <div className="fin-card overflow-hidden rounded-xl divide-y divide-zinc-200/80 lg:hidden dark:divide-zinc-800/80">
      <div className="flex items-center justify-between gap-2 bg-zinc-50/70 px-3.5 py-2.5 dark:bg-zinc-900/50">
        <div
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${bg}`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{analysis.healthShortLabel}</span>
        </div>

        <a
          href="#analisis-pintar"
          className="inline-flex h-6 items-center gap-1 text-xs font-semibold text-zinc-700 whitespace-nowrap hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
        >
          <span>Diagnosis</span>
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>

      <div className="grid grid-cols-2 divide-x divide-zinc-200/80 dark:divide-zinc-800/80">
        <div className="p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Arus Kas Bersih
          </p>
          <p
            className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${
              analysis.netCashflow > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : analysis.netCashflow < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-zinc-950 dark:text-zinc-100'
            }`}
          >
            {formatRupiah(analysis.netCashflow, { showSign: true })}
          </p>
        </div>
        <div className="p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {analysis.cashflowCase === 'deficit'
              ? 'Kas Bertahan'
              : analysis.mode === 'company'
                ? 'Kas Operasional'
                : 'Dana Darurat'}
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold text-zinc-950 tabular-nums dark:text-zinc-100">
            {runwayText}
          </p>
        </div>
      </div>
    </div>
  );
}
