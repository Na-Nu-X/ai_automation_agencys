import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ApiService } from '../../core/services/api.service';
import { formatDecimal, formatNumber } from '../../core/utils/format';
import { toLoadState } from '../../core/utils/load-state';
import { CaseStudyCardComponent } from '../../shared/components/case-study-card/case-study-card.component';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-case-studies',
  imports: [IconComponent, CaseStudyCardComponent, CtaBandComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './case-studies.component.html',
  styleUrl: './case-studies.component.scss',
})
export class CaseStudiesComponent {
  private readonly api = inject(ApiService);

  protected readonly state = toSignal(toLoadState(this.api.getCaseStudies()), { requireSync: true });
  protected readonly industry = signal<string | null>(null);

  private readonly all = computed(() => {
    const s = this.state();
    return s.status === 'success' ? s.data : [];
  });

  protected readonly industries = computed(() => [...new Set(this.all().map((c) => c.client_industry))]);

  protected readonly filtered = computed(() => {
    const selected = this.industry();
    return selected ? this.all().filter((c) => c.client_industry === selected) : this.all();
  });

  /** Aggregated portfolio metrics computed from the case studies. */
  protected readonly totals = computed(() => {
    const list = this.all();
    if (!list.length) return null;
    const hours = list.reduce((sum, c) => sum + c.hours_saved_monthly, 0);
    const avgReduction = list.reduce((sum, c) => sum + c.cost_reduction_percent, 0) / list.length;
    const avgPayback = list.reduce((sum, c) => sum + Number(c.payback_months), 0) / list.length;
    return {
      monthlyHours: formatNumber(hours),
      annualHours: formatNumber(hours * 12),
      avgReduction: formatNumber(avgReduction),
      avgPayback: formatDecimal(avgPayback),
    };
  });
}
