import django_filters

from .models import AutomationSolution, CaseStudy


class AutomationSolutionFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug", lookup_expr="exact")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = AutomationSolution
        fields = ["category", "featured"]


class CaseStudyFilter(django_filters.FilterSet):
    featured = django_filters.BooleanFilter(field_name="is_featured")
    industry = django_filters.CharFilter(field_name="client_industry", lookup_expr="icontains")

    class Meta:
        model = CaseStudy
        fields = ["featured", "industry"]
