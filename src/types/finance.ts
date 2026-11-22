export type FinanceMode = 'personal' | 'company';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface ModeFinancialData {
  cash: number;
  income: number;
  expenses: ExpenseItem[];
}

export interface TabunginStorageState {
  activeMode: FinanceMode;
  personal: ModeFinancialData;
  company: ModeFinancialData;
}

export type CashflowCase = 'no_expenses' | 'deficit' | 'surplus' | 'breakeven';

export type HealthLevel = 'healthy' | 'warning' | 'critical' | 'unassessed';

export interface LargestExpenseInfo {
  id: string;
  name: string;
  amount: number;
  percentage: number;
}

export interface ProjectionPoint {
  monthIndex: number;
  monthLabel: string;
  calendarLabel: string;
  balance: number;
  cumulativeChange: number;
}

export interface SmartDiagnostic {
  headline: string;
  reasonSummary: string;
  largestExpenseNote: string;
  impactSimulation: string;
  recommendations: string[];
}

export interface FinancialAnalysis {
  mode: FinanceMode;
  cash: number;
  income: number;
  totalExpenses: number;
  netCashflow: number;
  expenseRatio: number | null;
  expenseRatioLabel: string;
  maxHealthyRatio: number;
  cashflowCase: CashflowCase;
  burnRate: number;
  deficitRunwayMonths: number | null;
  deficitRunwayLabel: string;
  emergencyRunwayMonths: number | null;
  emergencyRunwayLabel: string;
  cashflowStatusLabel: string;
  targetEmergencyFund: number;
  emergencyFundGap: number;
  monthsToSafeReserve: number | null;
  healthLevel: HealthLevel;
  healthLabel: string;
  healthShortLabel: string;
  largestExpense: LargestExpenseInfo | null;
  expenseBreakdown: Array<{
    id: string;
    name: string;
    amount: number;
    percentage: number;
  }>;
  projection: ProjectionPoint[];
  zeroCrossMonth: number | null;
  diagnostic: SmartDiagnostic;
}
