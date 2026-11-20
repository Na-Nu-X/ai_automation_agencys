import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

/** Dark conversion band reused at the bottom of pages. */
@Component({
  selector: 'app-cta-band',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cta dark">
      <div class="container cta__inner">
        <div class="cta__copy">
          <span class="eyebrow">Ďalší krok</span>
          <h2>{{ title() }}</h2>
          <p class="lead">{{ text() }}</p>
        </div>
        <div class="cta__actions">
          <a routerLink="/kontakt" class="btn btn--primary btn--lg">
            Rezervovať bezplatný AI audit <app-icon name="arrow-right" />
          </a>
          <a [href]="'tel:' + contact.phoneHref" class="btn btn--ghost-light btn--lg">
            <app-icon name="phone" /> {{ contact.phone }}
          </a>
          <p class="cta__note"><span class="status-dot"></span>{{ contact.responseTime }}</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .cta {
      position: relative;
      overflow: hidden;
      padding-block: $space-16;
      @include grid-backdrop(rgb(248 250 252 / 0.04), 56px);

      @include up(md) {
        padding-block: $space-20;
      }

      &__inner {
        position: relative;
        display: grid;
        gap: $space-8;

        @include up(lg) {
          grid-template-columns: 1.4fr 1fr;
          align-items: center;
          gap: $space-16;
        }
      }

      &__copy {
        display: grid;
        gap: $space-4;
        max-width: 640px;
      }

      &__actions {
        display: grid;
        gap: $space-3;

        @include up(sm) {
          justify-items: start;
        }
      }

      &__note {
        display: inline-flex;
        align-items: center;
        gap: $space-3;
        margin-top: $space-2;
        font-size: 0.85rem;
        color: var(--color-dark-muted);
      }
    }
  `,
})
export class CtaBandComponent {
  readonly title = input('Zistite, koľko hodín mesačne môže AI ušetriť vašej firme');
  readonly text = input(
    'Za 45 minút zmapujeme vaše procesy a ukážeme konkrétne príležitosti na automatizáciu s odhadom návratnosti. Bezplatne a nezáväzne.',
  );
  protected readonly contact = SITE_CONFIG.contact;
}
