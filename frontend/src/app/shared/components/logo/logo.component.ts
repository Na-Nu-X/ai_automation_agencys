import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SITE_CONFIG } from '../../../core/config/site.config';

/** Brand mark + wordmark driven by site.config.ts. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.logo--light]': "tone() === 'light'" },
  template: `
    <svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" class="logo__mark-bg" />
      <path d="M9 10l7 13 7-13" class="logo__mark-stroke" />
      <circle cx="23" cy="10" r="2.4" class="logo__mark-dot" />
    </svg>
    <span class="logo__word">
      {{ brand.wordmark.primary }}<span class="logo__accent">{{ brand.wordmark.secondary }}</span>
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--color-text);
    }
    .logo__mark {
      width: 30px;
      height: 30px;
    }
    .logo__mark-bg {
      fill: var(--color-dark);
    }
    .logo__mark-stroke {
      fill: none;
      stroke: #f8fafc;
      stroke-width: 2.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .logo__mark-dot {
      fill: var(--color-accent);
    }
    .logo__word {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.3rem;
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .logo__accent {
      color: var(--color-accent);
      font-weight: 500;
    }
    :host(.logo--light) {
      color: var(--color-dark-text);
      .logo__mark-bg {
        fill: #f8fafc;
      }
      .logo__mark-stroke {
        stroke: var(--color-dark);
      }
      .logo__accent {
        color: #93b4ff;
      }
    }
  `,
})
export class LogoComponent {
  readonly tone = input<'dark' | 'light'>('dark');
  protected readonly brand = SITE_CONFIG.brand;
}
