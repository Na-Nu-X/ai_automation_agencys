/** Types mirroring the Django REST API payloads. Decimal fields arrive as strings. */

export interface CategoryBrief {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
}

export interface SolutionCategory extends CategoryBrief {
  short_summary: string;
  display_order: number;
  solution_count: number;
}

export interface AutomationSolution {
  id: number;
  name: string;
  slug: string;
  category: CategoryBrief;
  short_description: string;
  tech_stack: string[];
  typical_implementation_time: string;
  average_time_saved_label: string;
  starting_price_eur: string | null;
  is_featured: boolean;
}

export interface AutomationSolutionDetail extends AutomationSolution {
  detailed_description: string;
  problem_statement: string;
  workflow_steps: string[];
  integrations: string[];
}

export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  client_industry: string;
  client_descriptor: string;
  problem_before: string;
  ai_solution_built: string;
  result_after: string;
  hours_saved_monthly: number;
  cost_reduction_percent: number;
  payback_months: string;
  tools_used: string[];
  is_featured: boolean;
}

export interface TeamMember {
  id: number;
  full_name: string;
  role_title: string;
  bio: string;
  expertise_tags: string[];
  photo_url: string;
  linkedin_url: string;
}

export interface SolutionQuery {
  category?: string | null;
  featured?: boolean;
  search?: string | null;
  ordering?: string | null;
}

export interface DiscoveryCallPayload {
  solution: string | null;
  inquiry_type: string;
  company_name: string;
  team_size: string;
  primary_bottleneck: string;
  contact_name: string;
  work_email: string;
  phone: string;
  message: string;
  gdpr_consent: boolean;
}

export interface RoiLeadPayload {
  employees_count: number;
  weekly_manual_hours_per_person: number;
  hourly_cost_eur: number;
  contact_name: string;
  work_email: string;
  company_name: string;
  gdpr_consent: boolean;
}

export interface RoiLeadResponse extends RoiLeadPayload {
  id: number;
  calculated_annual_hours_saved: number;
  calculated_annual_savings_eur: string;
  estimated_investment_eur: string;
  payback_months: string;
  created_at: string;
}

/** DRF validation error shape: field -> messages, plus non_field_errors. */
export type ApiFieldErrors = Record<string, string[]>;
