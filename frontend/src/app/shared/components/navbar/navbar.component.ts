import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';

interface NavLink {
  label: string;
  path: string;
  fragment?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  host: {
    '[class.is-scrolled]': 'scrolled()',
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'close()',
  },
})
export class NavbarComponent {
  private readonly document = inject(DOCUMENT);

  protected readonly brand = SITE_CONFIG.brand;
  protected readonly contact = SITE_CONFIG.contact;
  protected readonly isOpen = signal(false);
  protected readonly scrolled = signal(false);

  protected readonly links: NavLink[] = [
    { label: 'AI Riešenia', path: '/riesenia' },
    { label: 'Prípadové štúdie', path: '/pripadove-studie' },
    { label: 'ROI Kalkulačka', path: '/', fragment: 'roi-kalkulacka' },
    { label: 'Ako pracujeme', path: '/ako-pracujeme' },
  ];

  protected readonly prefixMatch: IsActiveMatchOptions = {
    paths: 'subset',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };
  protected readonly fragmentMatch: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'exact',
    matrixParams: 'ignored',
  };

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.close());

    // Prevent background scrolling while the mobile drawer is open.
    effect(() => {
      this.document.body.style.overflow = this.isOpen() ? 'hidden' : '';
    });
  }

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected onScroll(): void {
    this.scrolled.set((this.document.defaultView?.scrollY ?? 0) > 8);
  }
}
