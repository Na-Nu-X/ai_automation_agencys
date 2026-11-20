"""ROI estimation logic shared by the API.

The frontend calculator mirrors these constants in
`frontend/src/app/core/utils/roi.ts` – keep them in sync.
"""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

AUTOMATION_EFFICIENCY = Decimal("0.70")
WORKING_WEEKS_PER_YEAR = 46  # 52 weeks minus vacation and public holidays
IMPLEMENTATION_BASE_EUR = Decimal("8000")
IMPLEMENTATION_PER_EMPLOYEE_EUR = Decimal("1200")


@dataclass(frozen=True)
class RoiEstimate:
    annual_hours_saved: int
    annual_savings_eur: Decimal
    estimated_investment_eur: Decimal
    payback_months: Decimal


def calculate_roi(employees: int, weekly_hours: int, hourly_cost: Decimal) -> RoiEstimate:
    hourly_cost = Decimal(hourly_cost)
    gross_hours = Decimal(employees * weekly_hours * WORKING_WEEKS_PER_YEAR)
    hours_saved = (gross_hours * AUTOMATION_EFFICIENCY).quantize(Decimal("1"), ROUND_HALF_UP)
    savings = (hours_saved * hourly_cost).quantize(Decimal("0.01"), ROUND_HALF_UP)
    investment = IMPLEMENTATION_BASE_EUR + IMPLEMENTATION_PER_EMPLOYEE_EUR * employees
    monthly_savings = savings / 12 if savings else Decimal("0")
    payback = (
        (investment / monthly_savings).quantize(Decimal("0.1"), ROUND_HALF_UP)
        if monthly_savings
        else Decimal("0")
    )
    return RoiEstimate(int(hours_saved), savings, investment, payback)
