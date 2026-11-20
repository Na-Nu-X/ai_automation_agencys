from decimal import Decimal

from django.core.management import call_command
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import AutomationSolution, DiscoveryCallRequest, RoiAuditLead
from .roi import calculate_roi


class ApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", stdout=open("/dev/null", "w"))

    def setUp(self):
        cache.clear()  # reset throttling counters
        self.client = APIClient()

    def test_seed_is_idempotent(self):
        call_command("seed_data", stdout=open("/dev/null", "w"))
        self.assertEqual(AutomationSolution.objects.count(), 10)

    def test_categories_include_counts(self):
        data = self.client.get("/api/categories/").json()
        self.assertEqual(len(data), 6)
        self.assertEqual([c["display_order"] for c in data], [1, 2, 3, 4, 5, 6])
        self.assertEqual(sum(c["solution_count"] for c in data), 10)

    def test_solution_filters(self):
        self.assertEqual(len(self.client.get("/api/solutions/?featured=true").json()), 6)
        by_cat = self.client.get("/api/solutions/?category=firemna-znalostna-baza-rag").json()
        self.assertEqual(len(by_cat), 2)
        self.assertTrue(self.client.get("/api/solutions/?search=n8n").json())
        ordered = self.client.get("/api/solutions/?ordering=-starting_price_eur").json()
        self.assertEqual(ordered[0]["starting_price_eur"], "8900.00")

    def test_solution_detail(self):
        slug = AutomationSolution.objects.first().slug
        data = self.client.get(f"/api/solutions/{slug}/").json()
        self.assertIn("workflow_steps", data)
        self.assertIn("name", data["category"])

    def test_case_studies_and_team(self):
        self.assertEqual(len(self.client.get("/api/case-studies/").json()), 4)
        self.assertEqual(len(self.client.get("/api/case-studies/?featured=true").json()), 3)
        self.assertEqual(len(self.client.get("/api/team/").json()), 3)

    def test_discovery_call_validation(self):
        res = self.client.post("/api/discovery-calls/", {"work_email": "bad"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("company_name", res.json())
        self.assertIn("gdpr_consent", res.json())

    def test_discovery_call_create(self):
        payload = {
            "solution": AutomationSolution.objects.first().slug,
            "inquiry_type": "konkretne_riesenie",
            "company_name": "Test s.r.o.",
            "team_size": "11_50",
            "primary_bottleneck": "zakaznicka_podpora",
            "contact_name": "Ján Novák",
            "work_email": "jan@test.sk",
            "phone": "+421 900 123 456",
            "gdpr_consent": True,
        }
        res = self.client.post("/api/discovery-calls/", payload, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(DiscoveryCallRequest.objects.count(), 1)
        # Leads must not be publicly listable.
        self.assertEqual(self.client.get("/api/discovery-calls/").status_code, 405)

    def test_roi_lead_is_computed_server_side(self):
        payload = {
            "employees_count": 10,
            "weekly_manual_hours_per_person": 10,
            "hourly_cost_eur": "30",
            "calculated_annual_savings_eur": "99999999",
            "contact_name": "Eva",
            "work_email": "eva@firma.sk",
            "company_name": "Firma a.s.",
            "gdpr_consent": True,
        }
        res = self.client.post("/api/roi-leads/", payload, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        expected = calculate_roi(10, 10, Decimal("30"))
        lead = RoiAuditLead.objects.get()
        self.assertEqual(lead.calculated_annual_hours_saved, expected.annual_hours_saved)
        self.assertEqual(expected.annual_hours_saved, 3220)
        self.assertEqual(lead.calculated_annual_savings_eur, Decimal("96600.00"))
        self.assertEqual(res.json()["payback_months"], "2.5")
