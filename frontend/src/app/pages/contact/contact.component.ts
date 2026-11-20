import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import { BOTTLENECKS, INQUIRY_TYPES, InquiryType, TEAM_SIZES } from '../../core/models/choices';
import { ApiService } from '../../core/services/api.service';
import { applyServerErrors, controlError } from '../../core/utils/api-errors';
import { IconComponent } from '../../shared/components/icon/icon.component';

type SubmitState = 'idle' | 'submitting' | 'success';

const PHONE_PATTERN = /^\+?[0-9 ()\-/]{9,20}$/;

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  protected readonly config = SITE_CONFIG;
  protected readonly inquiryTypes = INQUIRY_TYPES;
  protected readonly teamSizes = TEAM_SIZES;
  protected readonly bottlenecks = BOTTLENECKS;
  protected readonly controlError = controlError;

  protected readonly auditBenefits = [
    'Mapa procesov s najvyšším potenciálom automatizácie',
    'Odhad ušetrených hodín a návratnosti investície',
    'Odporúčaná architektúra a technológie',
    'Orientačný rozpočet a harmonogram',
  ];

  protected readonly solutions = toSignal(this.api.getSolutions().pipe(catchError(() => of([]))), {
    initialValue: [],
  });

  protected readonly form = this.fb.nonNullable.group({
    inquiry_type: ['ai_audit' as InquiryType, Validators.required],
    solution: [''],
    company_name: ['', [Validators.required, Validators.maxLength(160)]],
    team_size: ['', Validators.required],
    primary_bottleneck: ['', Validators.required],
    contact_name: ['', [Validators.required, Validators.maxLength(120)]],
    work_email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern(PHONE_PATTERN)],
    message: ['', Validators.maxLength(4000)],
    gdpr_consent: [false, Validators.requiredTrue],
  });

  protected readonly inquiryType = toSignal(this.form.controls.inquiry_type.valueChanges, {
    initialValue: this.form.controls.inquiry_type.value,
  });
  protected readonly showSolutionSelect = computed(() => this.inquiryType() === 'konkretne_riesenie');

  protected readonly submitState = signal<SubmitState>('idle');
  protected readonly submitError = signal<string | null>(null);
  protected readonly submittedEmail = signal('');

  constructor() {
    // Pre-fill from links such as /kontakt?typ=konkretne_riesenie&riesenie=<slug> or the ROI calculator.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const type = params.get('typ');
      const solution = params.get('riesenie');
      const message = params.get('sprava');
      if (type && INQUIRY_TYPES.some((t) => t.value === type)) {
        this.form.controls.inquiry_type.setValue(type as InquiryType);
      }
      if (solution) {
        this.form.controls.inquiry_type.setValue('konkretne_riesenie');
        this.form.controls.solution.setValue(solution);
      }
      if (message) this.form.controls.message.setValue(message.slice(0, 4000));
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Skontrolujte prosím zvýraznené polia.');
      this.focusFirstInvalid();
      return;
    }
    const value = this.form.getRawValue();
    this.submitState.set('submitting');
    this.submitError.set(null);

    this.api
      .createDiscoveryCall({
        ...value,
        solution: value.inquiry_type === 'konkretne_riesenie' && value.solution ? value.solution : null,
      })
      .subscribe({
        next: () => {
          this.submittedEmail.set(value.work_email);
          this.submitState.set('success');
          this.form.reset();
          globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
        },
        error: (err: unknown) => {
          this.submitError.set(applyServerErrors(this.form, err));
          this.submitState.set('idle');
        },
      });
  }

  protected startOver(): void {
    this.submitState.set('idle');
  }

  private focusFirstInvalid(): void {
    queueMicrotask(() => {
      const el = document.querySelector<HTMLElement>('.contact-form .ng-invalid:not(form)');
      el?.focus();
    });
  }
}
