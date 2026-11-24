import { useState } from 'react';
import type { FinancialAnalysis } from '../types/finance';
import { formatPercent, formatRupiah, formatRupiahCompact } from '../utils/finance';

interface CashProjectionChartProps {
  analysis: FinancialAnalysis;
  isDark?: boolean;
}

const BREAKDOWN_COLORS = [
  'bg-zinc-900 dark:bg-zinc-100',
  'bg-emerald-600 dark:bg-emerald-400',
  'bg-zinc-500 dark:bg-zinc-400',
  'bg-amber-500 dark:bg-amber-400',
  'bg-sky-600 dark:bg-sky-400',
  'bg-zinc-300 dark:bg-zinc-600',
];

export function CashProjectionChart({ analysis, isDark = false }: CashProjectionChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(12);
  const { projection, zeroCrossMonth, netCashflow, targetEmergencyFund } = analysis;

  const activePoint = projection[selectedMonth] ?? projection[12];

  // SVG Geometry
  const width = 680;
  const height = 216;
  const padLeft = 84;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 30;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const balances = projection.map((p) => p.balance);
  const rawMin = Math.min(...balances, 0);
  const rawMax = Math.max(...balances, 0);

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

  const yTicks = [0, 1, 2, 3].map((step) => {
    const val = minVal + ((maxVal - minVal) * step) / 3;
    return { val, y: getY(val) };
  });

  const strokeColor =
    netCashflow < 0
      ? isDark ? '#F87171' : '#DC2626'
      : netCashflow > 0
        ? isDark ? '#10B981' : '#059669'
        : isDark ? '#FBBF24' : '#D97706';
  const fillId =
    netCashflow < 0
      ? 'projGradRed'
      : netCashflow > 0
        ? 'projGradGreen'
        : 'projGradAmber';
  const gridStroke = isDark ? '#232329' : '#E4E4E7';
  const nodeIdleFill = isDark ? '#111114' : '#FFFFFF';
  const cursorLineStroke = isDark ? '#FAFAFA' : '#09090B';
  const targetStroke = isDark ? '#71717A' : '#71717A';
  const zeroStroke = isDark ? '#52525B' : '#A1A1AA';
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
      className="fin-card overflow-hidden rounded-xl divide-y divide-zinc-200/80 dark:divide-zinc-800/80"
    >
      {/* 1. Chart Header & Interactive Month Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50/70 px-4 py-3 dark:bg-zinc-900/50">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Proyeksi Saldo Kas 12 Bulan
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Simulasi linier arus kas · Arahkan kursor atau klik titik bulan
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <span className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              {activePoint.monthLabel} ({activePoint.calendarLabel})
            </span>
            <span
              className={`font-mono text-sm font-bold tabular-nums ${
                activePoint.balance < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-zinc-950 dark:text-white'
              }`}
            >
              {formatRupiah(activePoint.balance)}
            </span>
          </div>
          <span aria-hidden="true" className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="text-right">
            <span className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              Akumulasi
            </span>
            <span
              className={`font-mono text-xs font-semibold tabular-nums ${
                activePoint.cumulativeChange > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : activePoint.cumulativeChange < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {activePoint.monthIndex === 0
                ? 'Awal'
                : formatRupiahCompact(activePoint.cumulativeChange)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SVG Trajectory Plot */}
      <div className="px-4 py-3.5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Grafik proyeksi saldo kas dari ${formatRupiah(projection[0].balance)} saat ini hingga ${formatRupiah(projection[12].balance)} pada bulan ke-12`}
          className="h-auto w-full select-none"
        >
          <defs>
            <linearGradient id="projGradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#10B981' : '#059669'} stopOpacity={isDark ? '0.22' : '0.16'} />
              <stop offset="100%" stopColor={isDark ? '#10B981' : '#059669'} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="projGradAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#FBBF24' : '#D97706'} stopOpacity={isDark ? '0.20' : '0.15'} />
              <stop offset="100%" stopColor={isDark ? '#FBBF24' : '#D97706'} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="projGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#F87171' : '#DC2626'} stopOpacity={isDark ? '0.22' : '0.16'} />
              <stop offset="100%" stopColor={isDark ? '#F87171' : '#DC2626'} stopOpacity="0.0" />
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
                className="fill-zinc-400 text-[10px] dark:fill-zinc-500"
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
                strokeWidth="1"
                strokeDasharray="3 3"
                strokeOpacity="0.7"
              />
              <text
                x={width - padRight}
                y={getY(targetEmergencyFund) - 5}
                textAnchor="end"
                className="fill-zinc-500 text-[10px] font-medium dark:fill-zinc-400"
              >
                Target 6 bln ({formatRupiahCompact(targetEmergencyFund)})
              </text>
            </g>
          )}

          {/* Zero Baseline */}
          {minVal < 0 && (
            <g>
              <line
                x1={padLeft}
                y1={zeroY}
                x2={width - padRight}
                y2={zeroY}
                stroke={zeroStroke}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={width - padRight}
                y={zeroY - 5}
                textAnchor="end"
                className="fill-zinc-600 text-[10px] font-semibold dark:fill-zinc-300"
              >
                Batas Rp 0
              </text>
            </g>
          )}

          {/* Area & Line */}
          <path d={areaPath} fill={`url(#${fillId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
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
                strokeDasharray="2 2"
                strokeOpacity="0.6"
              />
              <circle
                cx={getX(zeroCrossMonth)}
                cy={zeroY}
                r="4"
                fill={zeroCrossStroke}
                stroke={nodeIdleFill}
                strokeWidth="1.5"
              />
              <text
                x={Math.min(width - padRight - 72, Math.max(padLeft + 4, getX(zeroCrossMonth) + 8))}
                y={Math.max(padTop + 12, zeroY - 10)}
                className="fill-red-600 text-[10px] font-semibold dark:fill-red-400"
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
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-zinc-400 text-[10px] font-medium dark:fill-zinc-500"
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
                    strokeOpacity="0.18"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 4.5 : 3}
                  fill={isSelected ? strokeColor : nodeIdleFill}
                  stroke={strokeColor}
                  strokeWidth="1.75"
                />

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

      {/* 3. Expense Composition Ledger */}
      {displayBreakdown.length > 0 && (
        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Distribusi Pengeluaran ({analysis.expenseBreakdown.length} Pos Aktif)
            </h4>
            <span className="font-mono text-xs font-semibold text-zinc-800 tabular-nums dark:text-zinc-200">
              {formatRupiah(analysis.totalExpenses)}/bln
            </span>
          </div>

          {/* Segmented Proportion Bar */}
          <div
            aria-hidden="true"
            className="mt-2 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
          >
            {displayBreakdown.map((item, idx) => (
              <div
                key={item.id}
                style={{ width: `${Math.max(1.5, item.percentage)}%` }}
                className={`${BREAKDOWN_COLORS[idx % BREAKDOWN_COLORS.length]} transition-all duration-200`}
              />
            ))}
          </div>

          {/* 2-Column Tabular Legend */}
          <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
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
                  <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                    {item.name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] tabular-nums">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(item.amount)}
                  </span>
                  <span className="w-10 text-right text-zinc-400 dark:text-zinc-500">
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
