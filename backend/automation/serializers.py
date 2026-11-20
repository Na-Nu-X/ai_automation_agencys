from rest_framework import serializers

from .models import (
    AutomationSolution,
    CaseStudy,
    DiscoveryCallRequest,
    RoiAuditLead,
    SolutionCategory,
    TeamMember,
)
from .roi import calculate_roi


class SolutionCategorySerializer(serializers.ModelSerializer):
    solution_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = SolutionCategory
        fields = ["id", "name", "slug", "short_summary", "icon_name", "display_order", "solution_count"]


class CategoryBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolutionCategory
        fields = ["id", "name", "slug", "icon_name"]


class AutomationSolutionListSerializer(serializers.ModelSerializer):
    category = CategoryBriefSerializer(read_only=True)

    class Meta:
        model = AutomationSolution
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "short_description",
            "tech_stack",
            "typical_implementation_time",
            "average_time_saved_label",
            "starting_price_eur",
            "is_featured",
        ]


class AutomationSolutionDetailSerializer(AutomationSolutionListSerializer):
    class Meta(AutomationSolutionListSerializer.Meta):
        fields = AutomationSolutionListSerializer.Meta.fields + [
            "detailed_description",
            "problem_statement",
            "workflow_steps",
            "integrations",
        ]


class CaseStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudy
        fields = [
            "id",
            "title",
            "slug",
            "client_industry",
            "client_descriptor",
            "problem_before",
            "ai_solution_built",
            "result_after",
            "hours_saved_monthly",
            "cost_reduction_percent",
            "payback_months",
            "tools_used",
            "is_featured",
        ]


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ["id", "full_name", "role_title", "bio", "expertise_tags", "photo_url", "linkedin_url"]


def _require_consent(value: bool) -> bool:
    if not value:
        raise serializers.ValidationError(
            "Pre odoslanie je potrebný súhlas so spracovaním osobných údajov."
        )
    return value


class DiscoveryCallRequestSerializer(serializers.ModelSerializer):
    solution = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=AutomationSolution.objects.all(),
        required=False,
        allow_null=True,
        error_messages={"does_not_exist": "Zvolené riešenie neexistuje."},
    )
    gdpr_consent = serializers.BooleanField()

    class Meta:
        model = DiscoveryCallRequest
        fields = [
            "id",
            "solution",
            "inquiry_type",
            "company_name",
            "team_size",
            "primary_bottleneck",
            "contact_name",
            "work_email",
            "phone",
            "message",
            "gdpr_consent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "company_name": {"error_messages": {"blank": "Zadajte názov firmy."}},
            "contact_name": {"error_messages": {"blank": "Zadajte meno kontaktnej osoby."}},
            "work_email": {
                "error_messages": {
                    "blank": "Zadajte pracovný e-mail.",
                    "invalid": "Zadajte platnú e-mailovú adresu.",
                }
            },
            "message": {"max_length": 4000},
        }

    def validate_gdpr_consent(self, value: bool) -> bool:
        return _require_consent(value)

    def validate_phone(self, value: str) -> str:
        cleaned = value.strip()
        digits = [c for c in cleaned if c.isdigit()]
        if cleaned and (len(digits) < 9 or any(c not in "+0123456789 ()-/" for c in cleaned)):
            raise serializers.ValidationError("Zadajte platné telefónne číslo, napr. +421 900 123 456.")
        return cleaned

    def validate(self, attrs):
        if attrs.get("inquiry_type") == DiscoveryCallRequest.InquiryType.SPECIFIC_SOLUTION and not attrs.get(
            "solution"
        ) and not attrs.get("message", "").strip():
            raise serializers.ValidationError(
                {"message": "Pri dopyte na konkrétne riešenie zvoľte riešenie alebo ho opíšte v správe."}
            )
        return attrs


class RoiAuditLeadSerializer(serializers.ModelSerializer):
    gdpr_consent = serializers.BooleanField()
    estimated_investment_eur = serializers.SerializerMethodField()
    payback_months = serializers.SerializerMethodField()

    class Meta:
        model = RoiAuditLead
        fields = [
            "id",
            "employees_count",
            "weekly_manual_hours_per_person",
            "hourly_cost_eur",
            "calculated_annual_hours_saved",
            "calculated_annual_savings_eur",
            "estimated_investment_eur",
            "payback_months",
            "contact_name",
            "work_email",
            "company_name",
            "gdpr_consent",
            "created_at",
        ]
        # Calculated values are always computed server-side to keep leads trustworthy.
        read_only_fields = [
            "id",
            "calculated_annual_hours_saved",
            "calculated_annual_savings_eur",
            "created_at",
        ]
        extra_kwargs = {
            "employees_count": {"min_value": 1, "max_value": 500},
            "weekly_manual_hours_per_person": {"min_value": 1, "max_value": 40},
            "hourly_cost_eur": {"min_value": 5, "max_value": 250},
            "company_name": {"error_messages": {"blank": "Zadajte názov firmy."}},
            "contact_name": {"error_messages": {"blank": "Zadajte meno kontaktnej osoby."}},
            "work_email": {
                "error_messages": {
                    "blank": "Zadajte pracovný e-mail.",
                    "invalid": "Zadajte platnú e-mailovú adresu.",
                }
            },
        }

    def validate_gdpr_consent(self, value: bool) -> bool:
        return _require_consent(value)

    def _estimate(self, obj: RoiAuditLead):
        return calculate_roi(obj.employees_count, obj.weekly_manual_hours_per_person, obj.hourly_cost_eur)

    def get_estimated_investment_eur(self, obj: RoiAuditLead) -> str:
        return str(self._estimate(obj).estimated_investment_eur)

    def get_payback_months(self, obj: RoiAuditLead) -> str:
        return str(self._estimate(obj).payback_months)

    def create(self, validated_data):
        estimate = calculate_roi(
            validated_data["employees_count"],
            validated_data["weekly_manual_hours_per_person"],
            validated_data["hourly_cost_eur"],
        )
        validated_data["calculated_annual_hours_saved"] = estimate.annual_hours_saved
        validated_data["calculated_annual_savings_eur"] = estimate.annual_savings_eur
        return super().create(validated_data)
