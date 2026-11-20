import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import { SECURITY_PILLARS } from '../../core/content/site-content';
import { ApiService } from '../../core/services/api.service';
import { SeoTitleStrategy } from '../../core/services/seo-title.strategy';
import { formatEur } from '../../core/utils/format';
import { toLoadState } from '../../core/utils/load-state';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SolutionCardComponent } from '../../shared/components/solution-card/solution-card.component';

@Component({
  selector: 'app-solution-detail',
  imports: [RouterLink, IconComponent, SolutionCardComponent, CtaBandComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solution-detail.component.html',
  styleUrl: './solution-detail.component.scss',
})
export class SolutionDetailComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoTitleStrategy);

  /** Bound from the `:slug` route parameter. */
  readonly slug = input.required<string>();

  protected readonly config = SITE_CONFIG;
  protected readonly securityPillars = SECURITY_PILLARS;

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(switchMap((slug) => toLoadState(this.api.getSolution(slug)))),
    { initialValue: { status: 'loading' as const } },
  );

  protected readonly solution = computed(() => {
    const s = this.state();
    return s.status === 'success' ? s.data : null;
  });

  protected readonly price = computed(() => {
    const value = this.solution()?.starting_price_eur;
    return value ? formatEur(value) : null;
  });

  protected readonly related = toSignal(
    toObservable(this.solution).pipe(
      switchMap((s) =>
        s
          ? this.api
              .getSolutions({ category: s.category.slug })
              .pipe(map((list) => list.filter((item) => item.slug !== s.slug).slice(0, 3)))
          : of([]),
      ),
    ),
    { initialValue: [] },
  );

  constructor() {
    effect(() => {
      const s = this.solution();
      if (s) this.seo.setPageTitle(s.name, s.short_description);
    });
  }
}
