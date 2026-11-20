import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly config = SITE_CONFIG;
  protected readonly year = new Date().getFullYear();

  protected readonly quickLinks = [
    { label: 'Katalóg AI riešení', path: '/riesenia' },
    { label: 'Prípadové štúdie', path: '/pripadove-studie' },
    { label: 'Ako pracujeme', path: '/ako-pracujeme' },
    { label: 'Bezplatný AI audit', path: '/kontakt' },
  ];
}
