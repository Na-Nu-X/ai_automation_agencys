import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RoiLeadResponse } from '../../../core/models/api.models';
import { ApiService } from '../../../core/services/api.service';
import { applyServerErrors, controlError } from '../../../core/utils/api-errors';
import { formatDecimal, formatEur, formatNumber } from '../../../core/utils/format';
import { AUTOMATION_EFFICIENCY, WORKING_WEEKS_PER_YEAR, calculateRoi } from '../../../core/utils/roi';
import { IconComponent } from '../icon/icon.component';

interface SliderConfig {
  id: 'employees' | 'weeklyHours' | 'hourlyCost';
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

type LeadState = 'idle' | 'open' | 'submitting' | 'success';

const MAX_DISPLAYED_PAYBACK = 36;

@Component({
  selector: 'app-roi-calculator',
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roi-calculator.component.html',
  styleUrl: './roi-calculator.component.scss',
})
export class AutomationRoiCalculatorComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly employees = signal(8);
  protected readonly weeklyHours = signal(10);
  protected readonly hourlyCost = signal(25);

  protected readonly sliders: SliderConfig[] = [
    {
      id: 'employees',
      label: 'Počet zamestnancov vykonávajúcich rutinnú agendu',
      min: 1,
      max: 50,
      step: 1,
      unit: 'osôb',
    },
    {
      id: 'weeklyHours',
      label: 'Priemerný počet hodín týždenne na rutinné úlohy (na 1 osobu)',
      min: 2,
      max: 25,
      step: 1,
      unit: 'hod.',
    },
    {
      id: 'hourlyCost',
      label: 'Priemerný superhrubý hodinový náklad na zamestnanca (€)',
      min: 15,
      max: 60,
      step: 1,
      unit: '€ / hod.',
    },
  ];

  protected readonly result = computed(() =>
    calculateRoi({
      employees: this.employees(),
      weeklyHours: this.weeklyHours(),
      hourlyCost: this.hourlyCost(),
    }),
  );

  protected readonly display = computed(() => {
    const r = this.result();
    const paybackCapped = r.paybackMonths > MAX_DISPLAYED_PAYBACK;
    return {
      hours: formatNumber(r.annualHoursSaved),
      savings: formatEur(r.annualSavingsEur),
      monthlySavings: formatEur(r.annualSavingsEur / 12),
      investment: formatEur(r.estimatedInvestmentEur),
      payback: paybackCapped ? `> ${MAX_DISPLAYED_PAYBACK}` : formatDecimal(r.paybackMonths),
      fte: formatDecimal(r.annualHoursSaved / (WORKING_WEEKS_PER_YEAR * 40)),
    };
  });

  protected readonly efficiencyPercent = AUTOMATION_EFFICIENCY * 100;
  protected readonly workingWeeks = WORKING_WEEKS_PER_YEAR;

  // Lead capture -----------------------------------------------------------
  protected readonly leadState = signal<LeadState>('idle');
  protected readonly leadError = signal<string | null>(null);
  protected readonly leadResult = signal<RoiLeadResponse | null>(null);

  protected readonly leadForm = this.fb.nonNullable.group({
    contact_name: ['', [Validators.required, Validators.maxLength(120)]],
    work_email: ['', [Validators.required, Validators.email]],
    company_name: ['', [Validators.required, Validators.maxLength(160)]],
    gdpr_consent: [false, Validators.requiredTrue],
  });

  protected readonly leadFields = [
    { name: 'contact_name', label: 'Meno a priezvisko', type: 'text', auto: 'name' },
    { name: 'work_email', label: 'Pracovný e-mail', type: 'email', auto: 'email' },
    { name: 'company_name', label: 'Názov firmy', type: 'text', auto: 'organization' },
  ] as const;

  protected readonly controlError = controlError;

  protected valueOf(id: SliderConfig['id']): number {
    return this[id]();
  }

  protected fillPercent(slider: SliderConfig): number {
    return ((this.valueOf(slider.id) - slider.min) / (slider.max - slider.min)) * 100;
  }

  protected onSlide(id: SliderConfig['id'], event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this[id].set(value);
    // A new estimate invalidates a previously submitted one.
    if (this.leadState() === 'success') this.leadState.set('idle');
  }

  protected openLeadForm(): void {
    this.leadState.set('open');
    this.leadError.set(null);
  }

  protected submitLead(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }
    this.leadState.set('submitting');
    this.leadError.set(null);
    this.api
      .createRoiLead({
        ...this.leadForm.getRawValue(),
        employees_count: this.employees(),
        weekly_manual_hours_per_person: this.weeklyHours(),
        hourly_cost_eur: this.hourlyCost(),
      })
      .subscribe({
        next: (response) => {
          this.leadResult.set(response);
          this.leadState.set('success');
          this.leadForm.reset();
        },
        error: (err: unknown) => {
          this.leadError.set(applyServerErrors(this.leadForm, err));
          this.leadState.set('open');
        },
      });
  }

  protected bookWithEstimate(): void {
    const d = this.display();
    const message =
      `Výsledok z ROI kalkulačky: ${this.employees()} zamestnancov × ${this.weeklyHours()} hod. týždenne ` +
      `rutinnej práce, náklad ${this.hourlyCost()} €/hod. Odhad: úspora ${d.hours} hodín a ${d.savings} ročne, ` +
      `návratnosť ${d.payback} mes. Radi by sme tento odhad overili v rámci AI auditu.`;
    void this.router.navigate(['/kontakt'], {
      queryParams: { typ: 'ai_audit', sprava: message },
    });
  }

  protected formatEur = formatEur;
  protected formatNumber = formatNumber;
}
