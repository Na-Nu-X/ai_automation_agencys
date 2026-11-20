import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { SolutionQuery } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { pluralSk } from '../../core/utils/format';
import { toLoadState } from '../../core/utils/load-state';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SolutionCardComponent } from '../../shared/components/solution-card/solution-card.component';

/** URL query parameter names (Slovak, shareable). */
const PARAM = { category: 'kategoria', search: 'hladat', ordering: 'zoradit' } as const;

@Component({
  selector: 'app-solutions',
  imports: [RouterLink, IconComponent, SolutionCardComponent, CtaBandComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solutions.component.html',
  styleUrl: './solutions.component.scss',
})
export class SolutionsComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly orderingOptions = [
    { value: '', label: 'Odporúčané' },
    { value: 'name', label: 'Názov (A – Z)' },
    { value: 'starting_price_eur', label: 'Cena od najnižšej' },
    { value: '-starting_price_eur', label: 'Cena od najvyššej' },
  ];

  // The URL is the single source of truth for filters.
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly category = computed(() => this.params().get(PARAM.category));
  protected readonly search = computed(() => this.params().get(PARAM.search) ?? '');
  protected readonly ordering = computed(() => this.params().get(PARAM.ordering) ?? '');

  /** Local input value – follows the URL but updates instantly while typing. */
  protected readonly searchDraft = linkedSignal(() => this.search());

  private readonly query = computed<SolutionQuery>(() => ({
    category: this.category(),
    search: this.search(),
    ordering: this.ordering(),
  }));

  protected readonly categories = toSignal(toLoadState(this.api.getCategories()), { requireSync: true });

  protected readonly results = toSignal(
    toObservable(this.query).pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap((q) => toLoadState(this.api.getSolutions(q))),
    ),
    { initialValue: { status: 'loading' as const } },
  );

  protected readonly activeCategoryName = computed(() => {
    const cats = this.categories();
    if (cats.status !== 'success') return null;
    return cats.data.find((c) => c.slug === this.category())?.name ?? null;
  });

  protected readonly resultLabel = computed(() => {
    const r = this.results();
    if (r.status !== 'success') return '';
    const n = r.data.length;
    return `${n} ${pluralSk(n, 'riešenie', 'riešenia', 'riešení')}`;
  });

  protected readonly hasActiveFilters = computed(() => !!(this.category() || this.search()));

  private readonly searchInput$ = new Subject<string>();

  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.updateParams({ [PARAM.search]: term.trim() || null }));
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchDraft.set(value);
    this.searchInput$.next(value);
  }

  protected selectCategory(slug: string | null): void {
    this.updateParams({ [PARAM.category]: slug });
  }

  protected onOrdering(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.updateParams({ [PARAM.ordering]: value || null });
  }

  protected resetFilters(): void {
    this.searchDraft.set('');
    void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  private updateParams(params: Record<string, string | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
