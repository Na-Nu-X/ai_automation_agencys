# AI Automation Agency – White-Label Web Platform

Production-ready full-stack website for a B2B AI automation agency
(*AI automatizačná agentúra a vývoj vlastných AI agentov*). The UI is in Slovak;
code, commits and documentation are in English.

| Layer    | Stack |
|----------|-------|
| Backend  | Python 3, Django, Django REST Framework, django-filter, django-cors-headers, Pillow |
| Frontend | Angular (standalone components, Signals, strict TypeScript), pure modular SCSS |
| Database | SQLite locally, PostgreSQL in production via `DATABASE_URL` |

```
.
├── backend/                 Django project (config/) + `automation` app
│   ├── automation/          models, serializers, views, admin, ROI logic, seed command, tests
│   ├── requirements.txt
│   └── .env.example
└── frontend/                Angular app
    └── src/
        ├── app/core/config/site.config.ts   ← white-label branding & business details
        ├── app/core/content/site-content.ts ← process steps, FAQ, security copy
        ├── app/pages/                       ← routed pages
        ├── app/shared/components/           ← navbar, footer, cards, ROI calculator, icons
        └── styles/                          ← _variables, _mixins, _typography, _base, _components
```

---

## Quick start

### 1. Backend (http://localhost:8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional – sensible defaults are built in
python manage.py migrate
python manage.py seed_data         # idempotent demo content (safe to re-run)
python manage.py createsuperuser   # account for /admin
python manage.py runserver
```

### 2. Frontend (http://localhost:4200)

```bash
cd frontend
npm install                        # .npmrc sets legacy-peer-deps (works around an npm resolver bug)
npm start                          # = ng serve
```

The frontend calls the API at `http://localhost:8000/api`
(`frontend/src/environments/environment.ts`). If port 8000 is taken, run
`python manage.py runserver 8001` and change `apiUrl` accordingly.

### 3. Admin panel

Open **http://localhost:8000/admin/** and sign in with the superuser created above.
The admin is fully in Slovak and lets the agency team manage:

- **Kategórie riešení** and **AI riešenia** (workflow steps, tech stack, integrations, pricing, featured flag)
- **Prípadové štúdie** (before/after, hours saved, cost reduction, payback)
- **Tím** (profiles, expertise tags, photos)
- **Rezervácie konzultácií / AI auditov** – incoming discovery calls, with filters and a "mark as processed" bulk action
- **Leady z ROI kalkulačky** – calculator estimates with server-computed savings, "mark as reviewed" action

---

## REST API

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET  | `/api/categories/` | Categories with `solution_count` |
| GET  | `/api/solutions/` | Filters: `category=<slug>`, `featured=true`, `search=<name / tech>`, `ordering=name\|starting_price_eur\|-starting_price_eur\|display_order` |
| GET  | `/api/solutions/<slug>/` | Full blueprint: workflow steps, tech stack, integrations, category |
| GET  | `/api/case-studies/` | Filters: `featured=true`, `industry=<text>` |
| GET  | `/api/team/` | Active team members |
| POST | `/api/discovery-calls/` | Discovery call / AI audit booking (validated, GDPR consent required) |
| POST | `/api/roi-leads/` | ROI calculator lead; savings are **recomputed server-side** |

Lead endpoints are write-only (no public listing) and rate-limited (`10/hour` per IP).

### ROI model

Shared by `backend/automation/roi.py` and `frontend/src/app/core/utils/roi.ts` (keep in sync):

- annual hours saved = employees × weekly routine hours × 46 working weeks × **0.70 automation efficiency**
- annual savings = hours saved × hourly cost
- estimated investment = 8 000 € + 1 200 € per employee
- payback (months) = investment ÷ monthly savings

---

## Rebranding for a new client

1. **Business details** – edit `frontend/src/app/core/config/site.config.ts`: name, wordmark, tagline,
   contact data, address, IČO / DIČ / IČ DPH, registry note, GDPR & EU AI Act copy, tech stack badges,
   trust metrics and social links. *All values shipped are demo placeholders.*
2. **Colours & fonts** – override the CSS custom properties in `frontend/src/styles/_base.scss` (`:root`)
   or the SCSS tokens in `_variables.scss`. Fonts are loaded in `frontend/src/index.html`.
3. **Marketing copy** – process steps, FAQ and security pillars live in
   `frontend/src/app/core/content/site-content.ts`.
4. **Logo mark** – `frontend/src/app/shared/components/logo/logo.component.ts` and `public/favicon.svg`.
5. **Catalogue content** – manage in `/admin`, or adapt `backend/automation/management/commands/seed_data.py`.

---

## Production notes

- Set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in `backend/.env`.
- PostgreSQL: `pip install -r requirements-prod.txt` and set
  `DATABASE_URL=postgres://user:password@host:5432/dbname`.
- `python manage.py collectstatic` and serve with a WSGI server (e.g. gunicorn) behind a reverse proxy.
- `ng build` outputs to `frontend/dist/frontend/browser`. The production build expects the API at `/api`
  on the same origin (`environment.production.ts`); serve the SPA with a fallback to `index.html`.

## Verification

```bash
cd backend && python manage.py check && python manage.py test automation
cd frontend && npx ng build
```
