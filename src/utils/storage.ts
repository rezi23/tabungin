import type { ModeFinancialData, TabunginStorageState } from '../types/finance';
import { getSampleData } from './presets';
import { sanitizeAmount } from './finance';

const STORAGE_KEY = 'tabungin_data_v1';

function isValidModeData(value: unknown): value is ModeFinancialData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.cash !== 'number' || typeof candidate.income !== 'number') return false;
  if (!Array.isArray(candidate.expenses)) return false;
  return true;
}

function sanitizeModeData(data: ModeFinancialData): ModeFinancialData {
  return {
    cash: sanitizeAmount(data.cash),
    income: sanitizeAmount(data.income),
    expenses: data.expenses
      .filter((item) => item && typeof item === 'object')
      .map((item, idx) => ({
        id: typeof item.id === 'string' && item.id.trim() ? item.id : `exp-${idx}-${Date.now()}`,
        name: typeof item.name === 'string' ? item.name : '',
        amount: sanitizeAmount(Number(item.amount)),
      })),
  };
}

export function getInitialStorageState(): TabunginStorageState {
  const fallback: TabunginStorageState = {
    activeMode: 'personal',
    personal: getSampleData('personal'),
    company: getSampleData('company'),
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<TabunginStorageState>;
    const activeMode = parsed.activeMode === 'company' ? 'company' : 'personal';
    const personal = isValidModeData(parsed.personal)
      ? sanitizeModeData(parsed.personal)
      : fallback.personal;
    const company = isValidModeData(parsed.company)
      ? sanitizeModeData(parsed.company)
      : fallback.company;

    return {
      activeMode,
      personal,
      company,
    };
  } catch {
    return fallback;
  }
}

export function saveStorageState(state: TabunginStorageState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}
