from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categories", views.SolutionCategoryViewSet, basename="category")
router.register("solutions", views.AutomationSolutionViewSet, basename="solution")
router.register("case-studies", views.CaseStudyViewSet, basename="case-study")
router.register("team", views.TeamMemberViewSet, basename="team")
router.register("discovery-calls", views.DiscoveryCallRequestViewSet, basename="discovery-call")
router.register("roi-leads", views.RoiAuditLeadViewSet, basename="roi-lead")

urlpatterns = router.urls
