/**
 * ROI estimation – mirrors `backend/automation/roi.py`. Keep constants in sync.
 */

export const AUTOMATION_EFFICIENCY = 0.7;
export const WORKING_WEEKS_PER_YEAR = 46;
export const IMPLEMENTATION_BASE_EUR = 8000;
export const IMPLEMENTATION_PER_EMPLOYEE_EUR = 1200;

export interface RoiInput {
  employees: number;
  weeklyHours: number;
  hourlyCost: number;
}

export interface RoiResult {
  annualHoursSaved: number;
  annualSavingsEur: number;
  estimatedInvestmentEur: number;
  paybackMonths: number;
}

export function calculateRoi({ employees, weeklyHours, hourlyCost }: RoiInput): RoiResult {
  const annualHoursSaved = Math.round(
    employees * weeklyHours * WORKING_WEEKS_PER_YEAR * AUTOMATION_EFFICIENCY,
  );
  const annualSavingsEur = Math.round(annualHoursSaved * hourlyCost * 100) / 100;
  const estimatedInvestmentEur = IMPLEMENTATION_BASE_EUR + IMPLEMENTATION_PER_EMPLOYEE_EUR * employees;
  const monthlySavings = annualSavingsEur / 12;
  const paybackMonths = monthlySavings > 0 ? Math.round((estimatedInvestmentEur / monthlySavings) * 10) / 10 : 0;
  return { annualHoursSaved, annualSavingsEur, estimatedInvestmentEur, paybackMonths };
}
