from django.contrib import admin
from django.db.models import Count

from .models import (
    AutomationSolution,
    CaseStudy,
    DiscoveryCallRequest,
    RoiAuditLead,
    SolutionCategory,
    TeamMember,
)

admin.site.site_header = "AI agentúra – administrácia"
admin.site.site_title = "AI agentúra"
admin.site.index_title = "Správa obsahu a dopytov"


class AutomationSolutionInline(admin.TabularInline):
    model = AutomationSolution
    fields = ["name", "typical_implementation_time", "is_featured", "display_order"]
    extra = 0
    show_change_link = True


@admin.register(SolutionCategory)
class SolutionCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "icon_name", "solution_count", "display_order"]
    list_editable = ["display_order"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}
    inlines = [AutomationSolutionInline]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_solution_count=Count("solutions"))

    @admin.display(description="Počet riešení", ordering="_solution_count")
    def solution_count(self, obj):
        return obj._solution_count


@admin.register(AutomationSolution)
class AutomationSolutionAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "typical_implementation_time",
        "starting_price_eur",
        "is_featured",
        "display_order",
    ]
    list_filter = ["category", "is_featured"]
    list_editable = ["is_featured", "display_order"]
    search_fields = ["name", "short_description", "detailed_description"]
    prepopulated_fields = {"slug": ["name"]}
    list_select_related = ["category"]
    fieldsets = [
        ("Základné údaje", {"fields": ["category", "name", "slug", "is_featured", "display_order"]}),
        (
            "Obsah",
            {"fields": ["short_description", "problem_statement", "detailed_description"]},
        ),
        ("Architektúra riešenia", {"fields": ["workflow_steps", "tech_stack", "integrations"]}),
        (
            "Obchodné parametre",
            {"fields": ["typical_implementation_time", "average_time_saved_label", "starting_price_eur"]},
        ),
    ]


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "client_industry",
        "hours_saved_monthly",
        "cost_reduction_percent",
        "payback_months",
        "is_featured",
        "display_order",
    ]
    list_filter = ["client_industry", "is_featured"]
    list_editable = ["is_featured", "display_order"]
    search_fields = ["title", "client_industry", "problem_before", "ai_solution_built"]
    prepopulated_fields = {"slug": ["title"]}
    fieldsets = [
        ("Klient", {"fields": ["title", "slug", "client_industry", "client_descriptor"]}),
        ("Príbeh", {"fields": ["problem_before", "ai_solution_built", "result_after", "tools_used"]}),
        (
            "Merateľné výsledky",
            {"fields": ["hours_saved_monthly", "cost_reduction_percent", "payback_months"]},
        ),
        ("Zobrazenie", {"fields": ["is_featured", "display_order"]}),
    ]


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ["full_name", "role_title", "is_active", "display_order"]
    list_editable = ["is_active", "display_order"]
    search_fields = ["full_name", "role_title"]


@admin.action(description="Označiť ako vybavené")
def mark_processed(modeladmin, request, queryset):
    queryset.update(is_processed=True)


@admin.action(description="Označiť ako skontrolované")
def mark_reviewed(modeladmin, request, queryset):
    queryset.update(is_reviewed=True)


@admin.register(DiscoveryCallRequest)
class DiscoveryCallRequestAdmin(admin.ModelAdmin):
    list_display = [
        "company_name",
        "contact_name",
        "inquiry_type",
        "team_size",
        "primary_bottleneck",
        "solution",
        "created_at",
        "is_processed",
    ]
    list_filter = ["is_processed", "inquiry_type", "team_size", "primary_bottleneck", "created_at"]
    list_editable = ["is_processed"]
    search_fields = ["company_name", "contact_name", "work_email", "message"]
    date_hierarchy = "created_at"
    actions = [mark_processed]
    list_select_related = ["solution"]
    readonly_fields = ["created_at", "gdpr_consent"]
    fieldsets = [
        ("Dopyt", {"fields": ["inquiry_type", "solution", "primary_bottleneck", "message"]}),
        ("Firma", {"fields": ["company_name", "team_size"]}),
        ("Kontakt", {"fields": ["contact_name", "work_email", "phone", "gdpr_consent"]}),
        ("Spracovanie", {"fields": ["is_processed", "internal_note", "created_at"]}),
    ]


@admin.register(RoiAuditLead)
class RoiAuditLeadAdmin(admin.ModelAdmin):
    list_display = [
        "company_name",
        "contact_name",
        "employees_count",
        "calculated_annual_hours_saved",
        "calculated_annual_savings_eur",
        "created_at",
        "is_reviewed",
    ]
    list_filter = ["is_reviewed", "created_at"]
    list_editable = ["is_reviewed"]
    search_fields = ["company_name", "contact_name", "work_email"]
    date_hierarchy = "created_at"
    actions = [mark_reviewed]
    readonly_fields = [
        "calculated_annual_hours_saved",
        "calculated_annual_savings_eur",
        "gdpr_consent",
        "created_at",
    ]
