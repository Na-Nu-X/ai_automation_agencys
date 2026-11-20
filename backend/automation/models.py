"""Domain models for the AI automation agency."""

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


def unique_slugify(instance: models.Model, value: str, max_length: int = 220) -> str:
    """Return a slug derived from `value` that is unique for the instance's model."""
    base = slugify(value)[:max_length].strip("-") or "polozka"
    slug = base
    model = instance.__class__
    counter = 2
    while model.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    return slug


class SlugMixin(models.Model):
    """Auto-generates a unique slug from the field named in `slug_source`."""

    slug_source = "name"

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slugify(self, getattr(self, self.slug_source))
        super().save(*args, **kwargs)


class SolutionCategory(SlugMixin):
    name = models.CharField("Názov kategórie", max_length=120, unique=True)
    slug = models.SlugField("URL identifikátor", max_length=140, unique=True, blank=True)
    short_summary = models.TextField("Krátke zhrnutie", blank=True)
    icon_name = models.CharField(
        "Názov ikony",
        max_length=50,
        blank=True,
        help_text="Identifikátor ikony vo frontende, napr. chat, invoice, target, database, plug, academy.",
    )
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "Kategória riešení"
        verbose_name_plural = "Kategórie riešení"

    def __str__(self) -> str:
        return self.name


class AutomationSolution(SlugMixin):
    category = models.ForeignKey(
        SolutionCategory,
        verbose_name="Kategória",
        related_name="solutions",
        on_delete=models.PROTECT,
    )
    name = models.CharField("Názov riešenia", max_length=200)
    slug = models.SlugField("URL identifikátor", max_length=220, unique=True, blank=True)
    short_description = models.TextField("Krátky popis")
    detailed_description = models.TextField("Detailný popis")
    problem_statement = models.TextField(
        "Aký problém riešenie odstraňuje",
        blank=True,
        help_text="Zobrazí sa v detaile riešenia v sekcii o probléme.",
    )
    workflow_steps = models.JSONField(
        "Kroky workflow",
        default=list,
        blank=True,
        help_text='Zoznam krokov ako JSON, napr. ["Príjem dopytu z e-mailu", "Analýza cez LLM"].',
    )
    tech_stack = models.JSONField(
        "Technologický stack",
        default=list,
        blank=True,
        help_text='Zoznam technológií ako JSON, napr. ["Python", "n8n", "PostgreSQL"].',
    )
    integrations = models.JSONField(
        "Integrácie",
        default=list,
        blank=True,
        help_text='Systémy, na ktoré sa riešenie napája, napr. ["Pipedrive", "Microsoft Teams"].',
    )
    typical_implementation_time = models.CharField(
        "Typická doba implementácie", max_length=60, help_text="Napr. 2 – 3 týždne"
    )
    average_time_saved_label = models.CharField(
        "Priemerná úspora času", max_length=120, help_text="Napr. Úspora 60 – 80 % manuálneho času"
    )
    starting_price_eur = models.DecimalField(
        "Cena od (€)", max_digits=10, decimal_places=2, null=True, blank=True
    )
    is_featured = models.BooleanField("Zvýraznené na úvodnej stránke", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)
    updated_at = models.DateTimeField("Upravené", auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "AI riešenie"
        verbose_name_plural = "AI riešenia"

    def __str__(self) -> str:
        return self.name


class CaseStudy(SlugMixin):
    slug_source = "title"

    title = models.CharField("Názov prípadovej štúdie", max_length=220)
    client_industry = models.CharField("Odvetvie klienta", max_length=120)
    slug = models.SlugField("URL identifikátor", max_length=240, unique=True, blank=True)
    client_descriptor = models.CharField(
        "Popis klienta",
        max_length=160,
        blank=True,
        help_text="Anonymizovaný popis, napr. Slovenský e-shop s 35 zamestnancami.",
    )
    problem_before = models.TextField("Stav pred nasadením AI")
    ai_solution_built = models.TextField("Vybudované AI riešenie")
    result_after = models.TextField("Stav po nasadení AI", blank=True)
    hours_saved_monthly = models.PositiveIntegerField("Ušetrené hodiny mesačne")
    cost_reduction_percent = models.PositiveSmallIntegerField(
        "Zníženie nákladov (%)", validators=[MaxValueValidator(100)]
    )
    payback_months = models.DecimalField("Návratnosť (mesiace)", max_digits=4, decimal_places=1)
    tools_used = models.JSONField("Použité nástroje", default=list, blank=True)
    is_featured = models.BooleanField("Zvýraznené", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        ordering = ["display_order", "title"]
        verbose_name = "Prípadová štúdia"
        verbose_name_plural = "Prípadové štúdie"

    def __str__(self) -> str:
        return self.title


class TeamMember(models.Model):
    full_name = models.CharField("Celé meno", max_length=120)
    role_title = models.CharField("Pozícia", max_length=120)
    bio = models.TextField("Profil")
    expertise_tags = models.JSONField(
        "Oblasti expertízy",
        default=list,
        blank=True,
        help_text='Zoznam ako JSON, napr. ["LLM Agenti", "RAG Architektúra", "Python"].',
    )
    photo_url = models.URLField("URL fotografie", max_length=500, blank=True)
    linkedin_url = models.URLField("LinkedIn profil", max_length=300, blank=True)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    is_active = models.BooleanField("Aktívny", default=True)

    class Meta:
        ordering = ["display_order", "full_name"]
        verbose_name = "Člen tímu"
        verbose_name_plural = "Tím"

    def __str__(self) -> str:
        return f"{self.full_name} – {self.role_title}"


class DiscoveryCallRequest(models.Model):
    class InquiryType(models.TextChoices):
        AI_AUDIT = "ai_audit", "Bezplatný AI audit procesov"
        SPECIFIC_SOLUTION = "konkretne_riesenie", "Dopyt na konkrétne AI riešenie"
        TEAM_TRAINING = "firemne_skolenie", "AI workshop pre tím"

    class TeamSize(models.TextChoices):
        SIZE_1_10 = "1_10", "1 – 10 zamestnancov"
        SIZE_11_50 = "11_50", "11 – 50 zamestnancov"
        SIZE_51_250 = "51_250", "51 – 250 zamestnancov"
        SIZE_250_PLUS = "250_plus", "250+ zamestnancov"

    class Bottleneck(models.TextChoices):
        CUSTOMER_SUPPORT = "zakaznicka_podpora", "Zákaznícka podpora"
        ADMINISTRATION = "administrativa", "Administratíva a faktúry"
        SALES_MARKETING = "obchod_marketing", "Obchod a marketing"
        INTERNAL_PROCESSES = "interne_procesy", "Interné procesy"
        KNOWLEDGE = "znalosti", "Práca s dokumentmi a znalosťami"
        OTHER = "ine", "Iné"

    solution = models.ForeignKey(
        AutomationSolution,
        verbose_name="Požadované riešenie",
        related_name="discovery_requests",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    inquiry_type = models.CharField(
        "Typ dopytu", max_length=30, choices=InquiryType.choices, default=InquiryType.AI_AUDIT
    )
    company_name = models.CharField("Názov firmy", max_length=160)
    team_size = models.CharField("Veľkosť tímu", max_length=20, choices=TeamSize.choices)
    primary_bottleneck = models.CharField(
        "Hlavné úzke hrdlo", max_length=30, choices=Bottleneck.choices
    )
    contact_name = models.CharField("Kontaktná osoba", max_length=120)
    work_email = models.EmailField("Pracovný e-mail")
    phone = models.CharField("Telefón", max_length=40, blank=True)
    message = models.TextField("Správa", blank=True)
    gdpr_consent = models.BooleanField("Súhlas so spracovaním osobných údajov", default=False)
    is_processed = models.BooleanField("Vybavené", default=False)
    internal_note = models.TextField("Interná poznámka", blank=True)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Rezervácia konzultácie"
        verbose_name_plural = "Rezervácie konzultácií / AI auditov"

    def __str__(self) -> str:
        return f"{self.company_name} – {self.get_inquiry_type_display()}"


class RoiAuditLead(models.Model):
    employees_count = models.PositiveIntegerField(
        "Počet zamestnancov", validators=[MinValueValidator(1), MaxValueValidator(10000)]
    )
    weekly_manual_hours_per_person = models.PositiveIntegerField(
        "Hodiny rutinnej práce týždenne (na osobu)",
        validators=[MinValueValidator(1), MaxValueValidator(60)],
    )
    hourly_cost_eur = models.DecimalField(
        "Superhrubý hodinový náklad (€)",
        max_digits=7,
        decimal_places=2,
        validators=[MinValueValidator(1)],
    )
    calculated_annual_hours_saved = models.PositiveIntegerField("Vypočítaná ročná úspora (hod.)")
    calculated_annual_savings_eur = models.DecimalField(
        "Vypočítaná ročná úspora (€)", max_digits=12, decimal_places=2
    )
    contact_name = models.CharField("Kontaktná osoba", max_length=120)
    work_email = models.EmailField("Pracovný e-mail")
    company_name = models.CharField("Názov firmy", max_length=160)
    gdpr_consent = models.BooleanField("Súhlas so spracovaním osobných údajov", default=False)
    is_reviewed = models.BooleanField("Skontrolované", default=False)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Lead z ROI kalkulačky"
        verbose_name_plural = "Leady z ROI kalkulačky"

    def __str__(self) -> str:
        return f"{self.company_name} – {self.calculated_annual_savings_eur} €"
