import { useState } from 'react';
import type { FinancialAnalysis } from '../types/finance';
import { formatPercent, formatRupiah, formatRupiahCompact } from '../utils/finance';

interface CashProjectionChartProps {
  analysis: FinancialAnalysis;
  isDark?: boolean;
}

const BREAKDOWN_COLORS = [
  'bg-teal-700 dark:bg-teal-500',
  'bg-slate-700 dark:bg-indigo-400',
  'bg-amber-500 dark:bg-amber-400',
  'bg-sky-600 dark:bg-sky-400',
  'bg-emerald-500 dark:bg-emerald-400',
  'bg-slate-400 dark:bg-slate-500',
];

export function CashProjectionChart({ analysis, isDark = false }: CashProjectionChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(12);
  const { projection, zeroCrossMonth, netCashflow, targetEmergencyFund } = analysis;

  const activePoint = projection[selectedMonth] ?? projection[12];

  // SVG Geometry — crisp compact aspect ratio with generous left padding for compact Rupiah labels
  const width = 680;
  const height = 224;
  const padLeft = 86;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const balances = projection.map((p) => p.balance);
  const rawMin = Math.min(...balances, 0);
  const rawMax = Math.max(...balances, 0);

  // Compute clean human-readable axis bounds and 4 evenly spaced ticks
  const rawSpan = Math.max(rawMax - rawMin, 1_000_000);
  const roughStep = rawSpan / 3;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  const niceMultiplier =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  const niceStep = niceMultiplier * magnitude;

  const minVal = Math.floor(rawMin / niceStep) * niceStep;
  const maxVal = Math.max(Math.ceil(rawMax / niceStep) * niceStep, minVal + niceStep * 3);

  const getX = (monthIdx: number) => padLeft + (monthIdx / 12) * plotW;
  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return padTop + plotH - ratio * plotH;
  };

  const zeroY = getY(0);

  const linePath = projection
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.monthIndex).toFixed(1)} ${getY(p.balance).toFixed(1)}`)
    .join(' ');

  const areaBaseY = Math.min(padTop + plotH, Math.max(padTop, zeroY));
  const areaPath = `${linePath} L ${getX(12).toFixed(1)} ${areaBaseY.toFixed(1)} L ${getX(0).toFixed(1)} ${areaBaseY.toFixed(1)} Z`;

  // Clean horizontal gridlines
  const yTicks = [0, 1, 2, 3].map((step) => {
    const val = minVal + ((maxVal - minVal) * step) / 3;
    return { val, y: getY(val) };
  });

  const strokeColor =
    netCashflow < 0
      ? isDark ? '#F87171' : '#DC2626'
      : netCashflow > 0
        ? isDark ? '#2DD4BF' : '#0F766E'
        : isDark ? '#FBBF24' : '#D97706';
  const fillId =
    netCashflow < 0
      ? 'projGradRed'
      : netCashflow > 0
        ? 'projGradTeal'
        : 'projGradAmber';
  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const nodeIdleFill = isDark ? '#0F172A' : '#FFFFFF';
  const cursorLineStroke = isDark ? '#F8FAFC' : '#0F172A';
  const targetStroke = isDark ? '#2DD4BF' : '#0F766E';
  const zeroStroke = isDark ? '#64748B' : '#94A3B8';
  const zeroCrossStroke = isDark ? '#F87171' : '#DC2626';

  const showTargetLine =
    targetEmergencyFund > 0 &&
    targetEmergencyFund > minVal &&
    targetEmergencyFund < maxVal;

  const topExpenses = analysis.expenseBreakdown.slice(0, 5);
  const otherAmount = analysis.expenseBreakdown
    .slice(5)
    .reduce((sum, item) => sum + item.amount, 0);

  const displayBreakdown =
    otherAmount > 0 && analysis.totalExpenses > 0
      ? [
          ...topExpenses,
          {
            id: 'other-expenses',
            name: 'Pos Lainnya',
            amount: otherAmount,
            percentage: (otherAmount / analysis.totalExpenses) * 100,
          },
        ]
      : topExpenses;

  return (
    <section
      id="proyeksi-saldo"
      aria-label="Grafik Proyeksi Saldo Kas 12 Bulan"
      className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-8px_rgba(15,23,42,0.05)] sm:p-5 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.03]"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 sm:text-[15px] dark:text-white">
            Proyeksi Saldo Kas 12 Bulan ke Depan
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Simulasi linier arus kas · Arahkan atau klik titik bulan
          </p>
        </div>

        {/* Interactive Active Month Readout */}
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {activePoint.monthLabel} · {activePoint.calendarLabel}
          </p>
          <p
            className={`font-mono text-sm font-bold tabular-nums sm:text-[15px] ${
              activePoint.balance < 0
                ? 'text-red-700 dark:text-red-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatRupiah(activePoint.balance)}
          </p>
          <p className="font-mono text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
            {activePoint.monthIndex === 0
              ? 'Saldo awal'
              : `Selisih ${formatRupiah(activePoint.cumulativeChange, { showSign: true })}`}
          </p>
        </div>
      </div>

      {/* Responsive SVG Area/Line Chart */}
      <div className="mt-3 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Grafik proyeksi saldo kas dari ${formatRupiah(projection[0].balance)} saat ini hingga ${formatRupiah(projection[12].balance)} pada bulan ke-12`}
          className="h-auto w-full select-none"
        >
          <defs>
            <linearGradient id="projGradTeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#2DD4BF' : '#0F766E'} stopOpacity={isDark ? '0.28' : '0.22'} />
              <stop offset="100%" stopColor={isDark ? '#2DD4BF' : '#0F766E'} stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="projGradAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#FBBF24' : '#D97706'} stopOpacity={isDark ? '0.26' : '0.20'} />
              <stop offset="100%" stopColor={isDark ? '#FBBF24' : '#D97706'} stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="projGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#F87171' : '#DC2626'} stopOpacity={isDark ? '0.26' : '0.20'} />
              <stop offset="100%" stopColor={isDark ? '#F87171' : '#DC2626'} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y Labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={width - padRight}
                y2={tick.y}
                stroke={gridStroke}
                strokeWidth="1"
              />
              <text
                x={padLeft - 10}
                y={tick.y + 3.5}
                textAnchor="end"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {formatRupiahCompact(tick.val)}
              </text>
            </g>
          ))}

          {/* Target 6-Month Safe Reserve Dashed Line */}
          {showTargetLine && (
            <g>
              <line
                x1={padLeft}
                y1={getY(targetEmergencyFund)}
                x2={width - padRight}
                y2={getY(targetEmergencyFund)}
                stroke={targetStroke}
                strokeWidth="1.25"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
              <text
                x={width - padRight}
                y={getY(targetEmergencyFund) - 6}
                textAnchor="end"
                className="fill-teal-700 text-[10px] font-medium dark:fill-teal-400"
              >
                Target aman 6 bln ({formatRupiahCompact(targetEmergencyFund)})
              </text>
            </g>
          )}

          {/* Zero Baseline (placed cleanly on the right edge above the line so it never collides with declining curves) */}
          {minVal < 0 && (
            <g>
              <line
                x1={padLeft}
                y1={zeroY}
                x2={width - padRight}
                y2={zeroY}
                stroke={zeroStroke}
                strokeWidth="1.25"
                strokeDasharray="3 3"
              />
              <text
                x={width - padRight}
                y={zeroY - 6}
                textAnchor="end"
                className="fill-slate-600 text-[10px] font-semibold dark:fill-slate-300"
              >
                Batas Rp 0 (Kas Habis)
              </text>
            </g>
          )}

          {/* Area & Line */}
          <path d={areaPath} fill={`url(#${fillId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Zero Crossing Callout Marker */}
          {zeroCrossMonth !== null && zeroCrossMonth > 0 && zeroCrossMonth <= 12 && (
            <g>
              <line
                x1={getX(zeroCrossMonth)}
                y1={padTop}
                x2={getX(zeroCrossMonth)}
                y2={padTop + plotH}
                stroke={zeroCrossStroke}
                strokeWidth="1"
                strokeDasharray="3 3"
                strokeOpacity="0.6"
              />
              <circle
                cx={getX(zeroCrossMonth)}
                cy={zeroY}
                r="4.5"
                fill={zeroCrossStroke}
                stroke={nodeIdleFill}
                strokeWidth="2"
              />
              <text
                x={Math.min(width - padRight - 72, Math.max(padLeft + 4, getX(zeroCrossMonth) + 8))}
                y={Math.max(padTop + 12, zeroY - 12)}
                className="fill-red-700 text-[10px] font-semibold dark:fill-red-400"
              >
                Habis Bln {zeroCrossMonth.toFixed(1).replace('.0', '').replace('.', ',')}
              </text>
            </g>
          )}

          {/* Interactive Month Nodes & X-Axis Labels */}
          {projection.map((point) => {
            const cx = getX(point.monthIndex);
            const cy = getY(point.balance);
            const isSelected = point.monthIndex === selectedMonth;
            const showXLabel = point.monthIndex % 3 === 0;

            return (
              <g key={point.monthIndex}>
                {showXLabel && (
                  <text
                    x={cx}
                    y={height - 12}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
                  >
                    {point.monthIndex === 0 ? 'Saat Ini' : point.calendarLabel.split(' ')[0]}
                  </text>
                )}

                {isSelected && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + plotH}
                    stroke={cursorLineStroke}
                    strokeWidth="1"
                    strokeOpacity="0.2"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 5.5 : 3.5}
                  fill={isSelected ? strokeColor : nodeIdleFill}
                  stroke={strokeColor}
                  strokeWidth="2"
                />

                {/* Generous invisible hit area for mouse & touch */}
                <rect
                  x={cx - plotW / 26}
                  y={padTop}
                  width={plotW / 13}
                  height={plotH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setSelectedMonth(point.monthIndex)}
                  onClick={() => setSelectedMonth(point.monthIndex)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Expense Composition Breakdown */}
      {displayBreakdown.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Komposisi Pengeluaran ({analysis.expenseBreakdown.length} pos aktif)
            </h4>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums dark:text-slate-300">
              {formatRupiah(analysis.totalExpenses)}/bln
            </span>
          </div>

          {/* Stacked Proportion Bar */}
          <div
            aria-hidden="true"
            className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          >
            {displayBreakdown.map((item, idx) => (
              <div
                key={item.id}
                style={{ width: `${Math.max(1.5, item.percentage)}%` }}
                className={`${BREAKDOWN_COLORS[idx % BREAKDOWN_COLORS.length]} transition-all duration-200 first:rounded-l-full last:rounded-r-full`}
              />
            ))}
          </div>

          {/* Clean Tabular Breakdown List */}
          <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
            {displayBreakdown.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-[2px] ${BREAKDOWN_COLORS[idx % BREAKDOWN_COLORS.length]}`}
                  />
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] tabular-nums">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(item.amount)}</span>
                  <span className="w-10 text-right text-slate-500 dark:text-slate-400">
                    {formatPercent(item.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
