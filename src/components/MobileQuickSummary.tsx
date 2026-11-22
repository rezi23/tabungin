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
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      Icon: ShieldCheck,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      Icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      Icon: AlertOctagon,
    },
    unassessed: {
      bg: 'bg-slate-100 border-slate-200 text-slate-700',
      Icon: CircleDashed,
    },
  };

  const { bg, Icon } = statusMap[analysis.healthLevel];
  const runwayText =
    analysis.cashflowCase === 'deficit'
      ? analysis.deficitRunwayLabel
      : analysis.emergencyRunwayLabel;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${bg}`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{analysis.healthShortLabel}</span>
        </div>

        <a
          href="#analisis-pintar"
          className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-teal-700 whitespace-nowrap hover:text-teal-800"
        >
          <span>Lihat Analisis</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-3 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-3">
        <div className="pr-3">
          <p className="text-[11px] font-medium text-slate-500">Arus Kas Bersih</p>
          <p
            className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${
              analysis.netCashflow > 0
                ? 'text-emerald-700'
                : analysis.netCashflow < 0
                  ? 'text-red-700'
                  : 'text-slate-900'
            }`}
          >
            {formatRupiah(analysis.netCashflow, { showSign: true })}
          </p>
        </div>
        <div className="pl-3">
          <p className="text-[11px] font-medium text-slate-500">
            {analysis.cashflowCase === 'deficit'
              ? 'Kas Bertahan'
              : analysis.mode === 'company'
                ? 'Kas Operasional'
                : 'Dana Darurat'}
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 tabular-nums">
            {runwayText}
          </p>
        </div>
      </div>
    </div>
  );
}
