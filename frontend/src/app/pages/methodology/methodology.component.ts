import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import {
  ENGINEERING_PRINCIPLES,
  FAQ_ITEMS,
  PROCESS_STEPS,
  SECURITY_PILLARS,
} from '../../core/content/site-content';
import { ApiService } from '../../core/services/api.service';
import { toLoadState } from '../../core/utils/load-state';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-methodology',
  imports: [RouterLink, IconComponent, CtaBandComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './methodology.component.html',
  styleUrl: './methodology.component.scss',
})
export class MethodologyComponent {
  private readonly api = inject(ApiService);

  protected readonly config = SITE_CONFIG;
  protected readonly principles = ENGINEERING_PRINCIPLES;
  protected readonly steps = PROCESS_STEPS;
  protected readonly security = SECURITY_PILLARS;
  protected readonly faqs = FAQ_ITEMS;

  protected readonly team = toSignal(toLoadState(this.api.getTeam()), { requireSync: true });

  /** Index of the expanded FAQ item (single-open accordion). */
  protected readonly openFaq = signal<number | null>(0);

  protected toggleFaq(index: number): void {
    this.openFaq.update((current) => (current === index ? null : index));
  }

  protected initials(name: string): string {
    return name
      .replace(/\b(Ing|Mgr|PhD|Bc|RNDr|MBA)\.?/g, '')
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('');
  }
}
