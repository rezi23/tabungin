import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeFinances,
  formatMonthsAndDays,
  formatRupiah,
  parseRupiahInput,
} from './finance';

const FIXED_DATE = new Date(2026, 10, 22); // 22 Nov 2026

test('formats Rupiah with dot thousand separators and signs cleanly', () => {
  assert.equal(formatRupiah(15_000_000), 'Rp 15.000.000');
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(-2_500_000), '-Rp 2.500.000');
  assert.equal(formatRupiah(3_250_000, { showSign: true }), '+Rp 3.250.000');
});

test('parses formatted Rupiah user input safely', () => {
  assert.equal(parseRupiahInput('15.000.000'), 15_000_000);
  assert.equal(parseRupiahInput('Rp 7.500.000'), 7_500_000);
  assert.equal(parseRupiahInput(''), 0);
  assert.equal(parseRupiahInput('abc'), 0);
});

test('formats runway into Bulan and Hari accurately', () => {
  assert.equal(formatMonthsAndDays(4.4), '4 Bulan 12 Hari');
  assert.equal(formatMonthsAndDays(6), '6 Bulan');
  assert.equal(formatMonthsAndDays(0.5), '15 Hari');
  assert.equal(formatMonthsAndDays(0), '0 Hari');
  assert.equal(formatMonthsAndDays(Number.NaN), '0 Hari');
});

test('handles Kasus C (total expenses = 0) with zero NaN or Infinity', () => {
  const result = analyzeFinances(
    'personal',
    { cash: 10_000_000, income: 8_000_000, expenses: [] },
    FIXED_DATE
  );

  assert.equal(result.cashflowCase, 'no_expenses');
  assert.equal(result.healthLevel, 'unassessed');
  assert.equal(result.expenseRatio, 0);
  assert.equal(result.emergencyRunwayMonths, null);
  assert.equal(result.deficitRunwayMonths, null);
  assert.equal(result.largestExpense, null);
  assert.equal(result.projection.length, 13);
  assert.equal(result.projection[12].balance, 10_000_000 + 8_000_000 * 12);
});

test('handles income = 0 with ongoing expenses safely without Infinity/NaN', () => {
  const result = analyzeFinances(
    'personal',
    {
      cash: 12_000_000,
      income: 0,
      expenses: [{ id: '1', name: 'Kos/Kontrakan', amount: 3_000_000 }],
    },
    FIXED_DATE
  );

  assert.equal(result.expenseRatio, null);
  assert.equal(result.expenseRatioLabel, '100%+ / Tanpa Pemasukan');
  assert.equal(result.cashflowCase, 'deficit');
  assert.equal(result.burnRate, 3_000_000);
  assert.equal(result.deficitRunwayMonths, 4);
  assert.equal(result.deficitRunwayLabel, '4 Bulan');
  assert.equal(result.healthLevel, 'critical');
  assert.equal(result.zeroCrossMonth, 4);
});

test('classifies Mode Pribadi SEHAT when ratio <= 80% and emergency fund >= 6 months', () => {
  const result = analyzeFinances(
    'personal',
    {
      cash: 50_000_000,
      income: 10_000_000,
      expenses: [
        { id: '1', name: 'Makan & Minum', amount: 4_000_000 },
        { id: '2', name: 'Kos/Kontrakan', amount: 4_000_000 },
      ],
    },
    FIXED_DATE
  );

  assert.equal(result.expenseRatio, 80);
  assert.equal(result.emergencyRunwayMonths, 6.25);
  assert.equal(result.healthLevel, 'healthy');
  assert.equal(result.cashflowStatusLabel, 'Bertumbuh (+Rp 2.000.000 / bulan)');
});

test('classifies Mode Pribadi WASPADA when surplus ratio is > 80% (82%) even with >= 6 mo reserve', () => {
  const result = analyzeFinances(
    'personal',
    {
      cash: 60_000_000,
      income: 10_000_000,
      expenses: [{ id: '1', name: 'Kebutuhan', amount: 8_200_000 }],
    },
    FIXED_DATE
  );

  assert.equal(result.healthLevel, 'warning');
});

test('classifies Mode Perusahaan SEHAT at 85% ratio with >= 6 mo reserve', () => {
  const result = analyzeFinances(
    'company',
    {
      cash: 520_000_000,
      income: 100_000_000,
      expenses: [
        { id: '1', name: 'Gaji Karyawan', amount: 50_000_000 },
        { id: '2', name: 'Sewa Tempat', amount: 35_000_000 },
      ],
    },
    FIXED_DATE
  );

  assert.equal(result.expenseRatio, 85);
  assert.equal(result.healthLevel, 'healthy');
  assert.ok(result.diagnostic.largestExpenseNote.includes('Gaji Karyawan'));
  assert.ok(result.diagnostic.largestExpenseNote.includes('58,8%'));
});

test('classifies WASPADA when surplus but emergency fund < 6 months and calculates months to safe target', () => {
  const result = analyzeFinances(
    'personal',
    {
      cash: 10_000_000,
      income: 10_000_000,
      expenses: [{ id: '1', name: 'Makan & Minum', amount: 5_000_000 }],
    },
    FIXED_DATE
  );

  // Target = 30jt, Cash = 10jt, Gap = 20jt, Surplus = 5jt/mo => 4 bulan
  assert.equal(result.healthLevel, 'warning');
  assert.equal(result.targetEmergencyFund, 30_000_000);
  assert.equal(result.emergencyFundGap, 20_000_000);
  assert.equal(result.monthsToSafeReserve, 4);
  assert.ok(result.diagnostic.impactSimulation.includes('4 bulan'));
});

test('classifies WASPADA when deficit but cash covers >= 6 months of deficit', () => {
  const result = analyzeFinances(
    'company',
    {
      cash: 80_000_000,
      income: 50_000_000,
      expenses: [{ id: '1', name: 'Gaji Karyawan', amount: 60_000_000 }],
    },
    FIXED_DATE
  );

  // Burn rate = 10jt, cash = 80jt => 8 months runway >= 6
  assert.equal(result.cashflowCase, 'deficit');
  assert.equal(result.deficitRunwayMonths, 8);
  assert.equal(result.healthLevel, 'warning');
  assert.ok(result.diagnostic.impactSimulation.includes('8 Bulan'));
});

test('classifies CRITICAL when cash is 0 and there are ongoing expenses even if surplus', () => {
  const result = analyzeFinances(
    'personal',
    {
      cash: 0,
      income: 10_000_000,
      expenses: [{ id: '1', name: 'Tagihan', amount: 4_000_000 }],
    },
    FIXED_DATE
  );

  assert.equal(result.healthLevel, 'critical');
  assert.ok(result.diagnostic.reasonSummary.includes('Rp 0'));
});

test('identifies largest expense accurately and generates 3 tailored recommendations', () => {
  const result = analyzeFinances(
    'company',
    {
      cash: 22_000_000,
      income: 15_000_000,
      expenses: [
        { id: '1', name: 'Makan Karyawan', amount: 9_000_000 },
        { id: '2', name: 'Operasional & Listrik', amount: 6_000_000 },
        { id: '3', name: 'Software/Tools', amount: 5_000_000 },
      ],
    },
    FIXED_DATE
  );

  // Total = 20jt, Burn = 5jt, Runway = 4.4 mo => 4 Bulan 12 Hari, Critical
  assert.equal(result.healthLevel, 'critical');
  assert.equal(result.deficitRunwayLabel, '4 Bulan 12 Hari');
  assert.equal(result.largestExpense?.name, 'Makan Karyawan');
  assert.equal(result.largestExpense?.percentage, 45);
  assert.ok(
    result.diagnostic.largestExpenseNote.includes(
      'Makan Karyawan sebesar Rp 9.000.000 (45% dari total pengeluaran operasional)'
    )
  );
  assert.ok(result.diagnostic.recommendations.length >= 2);
});
