import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container nf">
        <span class="nf__code mono">404</span>
        <h1 class="h2">Táto stránka neexistuje</h1>
        <p class="lead">Odkaz je pravdepodobne neaktuálny. Skúste začať na úvodnej stránke alebo v katalógu riešení.</p>
        <div class="nf__actions">
          <a routerLink="/" class="btn btn--primary"><app-icon name="arrow-left" /> Na úvodnú stránku</a>
          <a routerLink="/riesenia" class="btn">Katalóg AI riešení</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .nf {
      display: grid;
      gap: 1.25rem;
      justify-items: center;
      text-align: center;
      max-width: 640px;
      padding-block: 3rem;
    }
    .nf__code {
      font-size: 4.5rem;
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.05em;
      color: var(--color-accent);
    }
    .nf__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }
  `,
})
export class NotFoundComponent {}
