import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SITE_CONFIG } from '../config/site.config';

/** Sets `<title>` as "Page | Brand" and the meta description from route data. */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    const brand = SITE_CONFIG.brand.name;
    this.title.setTitle(pageTitle ? `${pageTitle} | ${brand}` : `${brand} – ${SITE_CONFIG.brand.tagline}`);

    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const description = (route.data['description'] as string | undefined) ?? SITE_CONFIG.brand.description;
    this.meta.updateTag({ name: 'description', content: description });
  }

  /** Allows pages with dynamic data (e.g. solution detail) to refine the title. */
  setPageTitle(pageTitle: string, description?: string): void {
    this.title.setTitle(`${pageTitle} | ${SITE_CONFIG.brand.name}`);
    if (description) this.meta.updateTag({ name: 'description', content: description });
  }
}
