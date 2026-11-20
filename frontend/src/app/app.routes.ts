import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    data: {
      description:
        'AI agenti a automatizácia procesov pre firmy: zákaznícka podpora, faktúry, obchod a firemné znalosti. Bezplatný AI audit a výpočet návratnosti.',
    },
  },
  {
    path: 'riesenia',
    title: 'Katalóg AI riešení',
    loadComponent: () =>
      import('./pages/solutions/solutions.component').then((m) => m.SolutionsComponent),
    data: {
      description:
        'Katalóg overených AI riešení a automatizácií podľa oddelení – s dobou implementácie, technológiami a očakávanou úsporou času.',
    },
  },
  {
    path: 'riesenia/:slug',
    title: 'Detail riešenia',
    loadComponent: () =>
      import('./pages/solution-detail/solution-detail.component').then(
        (m) => m.SolutionDetailComponent,
      ),
  },
  {
    path: 'pripadove-studie',
    title: 'Prípadové štúdie a ROI',
    loadComponent: () =>
      import('./pages/case-studies/case-studies.component').then((m) => m.CaseStudiesComponent),
    data: {
      description:
        'Prípadové štúdie nasadenia AI vo firmách: ušetrené hodiny, zníženie nákladov a návratnosť investície v číslach.',
    },
  },
  {
    path: 'ako-pracujeme',
    title: 'Ako pracujeme',
    loadComponent: () =>
      import('./pages/methodology/methodology.component').then((m) => m.MethodologyComponent),
    data: {
      description:
        'Naša metodika nasadzovania AI: audit, architektúra, vývoj a podpora. Bezpečnosť dát, hosting v EÚ a tím AI architektov.',
    },
  },
  {
    path: 'kontakt',
    title: 'Bezplatný AI audit a kontakt',
    loadComponent: () =>
      import('./pages/contact/contact.component').then((m) => m.ContactComponent),
    data: {
      description:
        'Rezervujte si bezplatný AI audit procesov alebo nezáväznú konzultáciu k AI riešeniu pre vašu firmu.',
    },
  },
  {
    path: '**',
    title: 'Stránka sa nenašla',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
