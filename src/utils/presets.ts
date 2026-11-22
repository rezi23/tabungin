import type { FinanceMode, ModeFinancialData } from '../types/finance';

export const PERSONAL_QUICK_CATEGORIES: string[] = [
  'Makan & Minum',
  'Kos/Kontrakan',
  'Transportasi',
  'Tagihan',
  'Hiburan',
  'Belanja Bulanan',
  'Cicilan',
  'Kesehatan',
];

export const COMPANY_QUICK_CATEGORIES: string[] = [
  'Gaji Karyawan',
  'Makan Karyawan',
  'Sewa Tempat',
  'Operasional & Listrik',
  'Marketing',
  'Software/Tools',
  'Bahan Baku / Stok',
  'Pajak & Legalitas',
];

export function getQuickCategories(mode: FinanceMode): string[] {
  return mode === 'personal' ? PERSONAL_QUICK_CATEGORIES : COMPANY_QUICK_CATEGORIES;
}

export function getSampleData(mode: FinanceMode): ModeFinancialData {
  if (mode === 'personal') {
    return {
      cash: 42_000_000,
      income: 12_500_000,
      expenses: [
        { id: 'p-1', name: 'Kos/Kontrakan', amount: 2_500_000 },
        { id: 'p-2', name: 'Makan & Minum', amount: 2_800_000 },
        { id: 'p-3', name: 'Transportasi', amount: 1_100_000 },
        { id: 'p-4', name: 'Tagihan', amount: 1_200_000 },
        { id: 'p-5', name: 'Hiburan', amount: 900_000 },
      ],
    };
  }

  return {
    cash: 145_000_000,
    income: 88_000_000,
    expenses: [
      { id: 'c-1', name: 'Gaji Karyawan', amount: 38_000_000 },
      { id: 'c-2', name: 'Makan Karyawan', amount: 7_500_000 },
      { id: 'c-3', name: 'Sewa Tempat', amount: 14_000_000 },
      { id: 'c-4', name: 'Operasional & Listrik', amount: 8_500_000 },
      { id: 'c-5', name: 'Marketing', amount: 12_000_000 },
      { id: 'c-6', name: 'Software/Tools', amount: 3_500_000 },
    ],
  };
}

export function getEmptyData(): ModeFinancialData {
  return {
    cash: 0,
    income: 0,
    expenses: [],
  };
}
