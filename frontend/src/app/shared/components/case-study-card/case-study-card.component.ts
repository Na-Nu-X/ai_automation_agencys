import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CaseStudy } from '../../../core/models/api.models';
import { formatDecimal, formatNumber } from '../../../core/utils/format';

/**
 * Case study presentation. `compact` shows metrics + summary (home page),
 * the full variant adds the before/after comparison (case studies page).
 */
@Component({
  selector: 'app-case-study-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './case-study-card.component.html',
  styleUrl: './case-study-card.component.scss',
  host: { '[class.is-compact]': 'compact()' },
})
export class CaseStudyCardComponent {
  readonly study = input.required<CaseStudy>();
  readonly compact = input(false);

  protected readonly hours = computed(() => formatNumber(this.study().hours_saved_monthly));
  protected readonly payback = computed(() => formatDecimal(this.study().payback_months));
}
