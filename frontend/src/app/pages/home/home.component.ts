import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { PROCESS_STEPS, SECURITY_PILLARS } from '../../core/content/site-content';
import { ApiService } from '../../core/services/api.service';
import { toLoadState } from '../../core/utils/load-state';
import { CaseStudyCardComponent } from '../../shared/components/case-study-card/case-study-card.component';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AutomationRoiCalculatorComponent } from '../../shared/components/roi-calculator/roi-calculator.component';
import { SolutionCardComponent } from '../../shared/components/solution-card/solution-card.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    IconComponent,
    SolutionCardComponent,
    CaseStudyCardComponent,
    AutomationRoiCalculatorComponent,
    CtaBandComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly api = inject(ApiService);

  protected readonly config = SITE_CONFIG;
  protected readonly processSteps = PROCESS_STEPS;
  protected readonly securityPillars = SECURITY_PILLARS;

  protected readonly solutions = toSignal(toLoadState(this.api.getSolutions({ featured: true })), {
    requireSync: true,
  });
  protected readonly categories = toSignal(toLoadState(this.api.getCategories()), {
    requireSync: true,
  });
  protected readonly caseStudies = toSignal(toLoadState(this.api.getCaseStudies(true)), {
    requireSync: true,
  });

  /** Illustrative pipeline shown in the hero "system panel". */
  protected readonly pipeline = [
    { icon: 'mail', label: 'Prijatá faktúra · dodavatel@firma.sk', meta: 'PDF · 2 strany', state: 'Prijaté' },
    { icon: 'cpu', label: 'Extrakcia polí a kontrola DPH', meta: 'LLM · istota 0,98', state: 'Overené' },
    { icon: 'database', label: 'Párovanie s objednávkou OBJ-2481', meta: 'ERP · zhoda 100 %', state: 'Spárované' },
    { icon: 'check-circle', label: 'Zápis do účtovného systému', meta: 'Pohoda · 1,8 s', state: 'Hotovo' },
  ];
}
