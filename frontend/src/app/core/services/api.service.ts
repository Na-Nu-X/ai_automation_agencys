import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AutomationSolution,
  AutomationSolutionDetail,
  CaseStudy,
  DiscoveryCallPayload,
  RoiLeadPayload,
  RoiLeadResponse,
  SolutionCategory,
  SolutionQuery,
  TeamMember,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Rarely-changing reference data is cached for the lifetime of the app.
  private categories$?: Observable<SolutionCategory[]>;
  private team$?: Observable<TeamMember[]>;

  getCategories(): Observable<SolutionCategory[]> {
    this.categories$ ??= this.http
      .get<SolutionCategory[]>(`${this.baseUrl}/categories/`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.categories$;
  }

  getSolutions(query: SolutionQuery = {}): Observable<AutomationSolution[]> {
    let params = new HttpParams();
    if (query.category) params = params.set('category', query.category);
    if (query.featured) params = params.set('featured', 'true');
    if (query.search) params = params.set('search', query.search);
    if (query.ordering) params = params.set('ordering', query.ordering);
    return this.http.get<AutomationSolution[]>(`${this.baseUrl}/solutions/`, { params });
  }

  getSolution(slug: string): Observable<AutomationSolutionDetail> {
    return this.http.get<AutomationSolutionDetail>(
      `${this.baseUrl}/solutions/${encodeURIComponent(slug)}/`,
    );
  }

  getCaseStudies(featuredOnly = false): Observable<CaseStudy[]> {
    const params = featuredOnly ? new HttpParams().set('featured', 'true') : undefined;
    return this.http.get<CaseStudy[]>(`${this.baseUrl}/case-studies/`, { params });
  }

  getTeam(): Observable<TeamMember[]> {
    this.team$ ??= this.http
      .get<TeamMember[]>(`${this.baseUrl}/team/`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.team$;
  }

  createDiscoveryCall(payload: DiscoveryCallPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/discovery-calls/`, payload);
  }

  createRoiLead(payload: RoiLeadPayload): Observable<RoiLeadResponse> {
    return this.http.post<RoiLeadResponse>(`${this.baseUrl}/roi-leads/`, payload);
  }
}
