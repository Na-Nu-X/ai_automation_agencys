from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.throttling import ScopedRateThrottle

from .filters import AutomationSolutionFilter, CaseStudyFilter
from .models import (
    AutomationSolution,
    CaseStudy,
    DiscoveryCallRequest,
    RoiAuditLead,
    SolutionCategory,
    TeamMember,
)
from .serializers import (
    AutomationSolutionDetailSerializer,
    AutomationSolutionListSerializer,
    CaseStudySerializer,
    DiscoveryCallRequestSerializer,
    RoiAuditLeadSerializer,
    SolutionCategorySerializer,
    TeamMemberSerializer,
)


class SolutionCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SolutionCategorySerializer
    lookup_field = "slug"
    pagination_class = None
    filter_backends = []

    def get_queryset(self):
        return SolutionCategory.objects.annotate(solution_count=Count("solutions")).order_by(
            "display_order", "name"
        )


class AutomationSolutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AutomationSolution.objects.select_related("category")
    lookup_field = "slug"
    pagination_class = None
    filterset_class = AutomationSolutionFilter
    ordering_fields = ["name", "display_order", "starting_price_eur", "created_at"]
    ordering = ["display_order", "name"]
    # SearchFilter is replaced by the custom search in filter_queryset below.
    filter_backends = [DjangoFilterBackend, OrderingFilter]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AutomationSolutionDetailSerializer
        return AutomationSolutionListSerializer

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        # Custom search: JSON tech_stack lookups aren't portable across DB engines with
        # DRF's SearchFilter, so a text match on the serialized JSON is used instead.
        term = self.request.query_params.get("search", "").strip()
        if term:
            queryset = queryset.filter(
                Q(name__icontains=term)
                | Q(short_description__icontains=term)
                | Q(category__name__icontains=term)
                | Q(tech_stack__icontains=term)
            )
        return queryset


class CaseStudyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CaseStudy.objects.all()
    serializer_class = CaseStudySerializer
    lookup_field = "slug"
    pagination_class = None
    filterset_class = CaseStudyFilter
    ordering_fields = ["display_order", "hours_saved_monthly", "cost_reduction_percent"]


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamMember.objects.filter(is_active=True)
    serializer_class = TeamMemberSerializer
    pagination_class = None
    filter_backends = []


class LeadCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Write-only endpoint: leads are never exposed publicly."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "lead_submissions"
    filter_backends = []


class DiscoveryCallRequestViewSet(LeadCreateViewSet):
    queryset = DiscoveryCallRequest.objects.none()
    serializer_class = DiscoveryCallRequestSerializer


class RoiAuditLeadViewSet(LeadCreateViewSet):
    queryset = RoiAuditLead.objects.none()
    serializer_class = RoiAuditLeadSerializer
