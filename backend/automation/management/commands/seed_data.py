"""Idempotent seed command: `python manage.py seed_data`.

Running it repeatedly updates the demo content in place (matched by slug or
name) instead of creating duplicates. Leads and bookings are never touched.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from automation.models import AutomationSolution, CaseStudy, SolutionCategory, TeamMember

UNSPLASH = "https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=800&q=80"

CATEGORIES = [
    {
        "name": "AI Zákaznícka podpora & Chatboty",
        "icon_name": "chat",
        "short_summary": "Autonómni AI asistenti, ktorí 24/7 odpovedajú zákazníkom na webe, e-maile aj v chate a zložité prípady odovzdávajú operátorom s plným kontextom.",
    },
    {
        "name": "Automatizácia fakturácie a back-office",
        "icon_name": "invoice",
        "short_summary": "Vyťaženie dát z faktúr, objednávok a zmlúv, ich kontrola a automatický zápis do ERP či účtovného systému bez prepisovania.",
    },
    {
        "name": "AI Obchodný tím & Lead Generation",
        "icon_name": "target",
        "short_summary": "Prospekting, obohacovanie leadov, personalizované oslovenie a automatická synchronizácia obchodných stretnutí do CRM.",
    },
    {
        "name": "Firemná znalostná báza (RAG)",
        "icon_name": "database",
        "short_summary": "Interný AI vyhľadávač nad smernicami, zmluvami a dokumentáciou, ktorý odpovedá presne a s odkazom na zdroj.",
    },
    {
        "name": "Integrácie systémov (n8n / Make / Custom API)",
        "icon_name": "plug",
        "short_summary": "Prepájame CRM, ERP, e-shop, e-mail a interné nástroje do spoľahlivých dátových tokov s monitoringom a logovaním.",
    },
    {
        "name": "AI Školenia a firemné workshopy",
        "icon_name": "academy",
        "short_summary": "Praktické workshopy pre manažment aj tímy: bezpečné používanie AI, prompt engineering a identifikácia procesov na automatizáciu.",
    },
]

SOLUTIONS = [
    {
        "category": "AI Zákaznícka podpora & Chatboty",
        "name": "Autonómny AI asistent zákazníckej podpory (24/7)",
        "is_featured": True,
        "short_description": "AI agent, ktorý samostatne vybaví 60 – 75 % opakujúcich sa dopytov na webe, v e-maile aj v chate a zvyšok odovzdá operátorovi s pripraveným návrhom odpovede.",
        "problem_statement": "Tím podpory trávi väčšinu dňa odpovedaním na tie isté otázky o stave objednávky, reklamáciách či podmienkach. Reakčná doba sa mimo pracovných hodín predlžuje na desiatky hodín a zákazníci odchádzajú ku konkurencii.",
        "detailed_description": "Asistent je napojený na vašu znalostnú bázu, obchodné podmienky a interné systémy (e-shop, CRM, objednávky). Rozumie slovenčine, češtine aj angličtine, overuje údaje v reálnom čase a pri citlivých alebo nejasných prípadoch eskaluje na človeka. Každá konverzácia je logovaná a priebežne vyhodnocovaná, takže presne viete, koľko dopytov AI vyriešila a s akou spokojnosťou.",
        "workflow_steps": [
            "Príjem dopytu z e-mailu, webového chatu alebo kontaktného formulára",
            "Analýza kontextu cez LLM a overenie údajov v CRM či e-shope",
            "Vyhľadanie odpovede v znalostnej báze a obchodných podmienkach",
            "Automatická odpoveď alebo eskalácia na operátora s návrhom riešenia",
            "Zápis konverzácie a štítkovanie dopytu pre reporting",
        ],
        "tech_stack": ["Python", "OpenAI / Claude API", "n8n", "PostgreSQL", "pgvector", "REST API"],
        "integrations": ["Shoptet / WooCommerce", "Freshdesk / Zendesk", "Gmail / Outlook", "Slack / Teams"],
        "typical_implementation_time": "3 – 5 týždňov",
        "average_time_saved_label": "Úspora 60 – 75 % času podpory",
        "starting_price_eur": Decimal("6900"),
    },
    {
        "category": "AI Zákaznícka podpora & Chatboty",
        "name": "AI triedenie a smerovanie prichádzajúcich e-mailov",
        "is_featured": False,
        "short_description": "Automatická klasifikácia prichádzajúcej pošty podľa témy, priority a sentimentu s priradením správnemu oddeleniu a návrhom odpovede.",
        "problem_statement": "Zdieľané schránky typu info@ či objednavky@ sa denne plnia stovkami správ. Ručné triedenie zaberá hodiny a urgentné požiadavky zapadnú medzi bežnou komunikáciou.",
        "detailed_description": "Model analyzuje obsah, prílohy a históriu odosielateľa, priradí kategóriu a prioritu, extrahuje kľúčové údaje (číslo objednávky, IČO, termín) a založí tiket v správnom systéme. Pravidlá smerovania si upravíte bez programovania.",
        "workflow_steps": [
            "Načítanie novej správy zo zdieľanej schránky",
            "Klasifikácia témy, priority a sentimentu cez LLM",
            "Extrakcia štruktúrovaných údajov z textu a príloh",
            "Založenie tiketu a priradenie zodpovednému oddeleniu",
        ],
        "tech_stack": ["Python", "Claude API", "Make", "Microsoft Graph API"],
        "integrations": ["Microsoft 365", "Gmail", "Jira Service Management", "Pipedrive"],
        "typical_implementation_time": "2 – 3 týždne",
        "average_time_saved_label": "Úspora 70 – 85 % času na triedenie",
        "starting_price_eur": Decimal("3900"),
    },
    {
        "category": "Automatizácia fakturácie a back-office",
        "name": "Automatické spracovanie prijatých faktúr a objednávok do ERP",
        "is_featured": True,
        "short_description": "Vyťaženie údajov z PDF faktúr a objednávok, kontrola voči objednávkam a dodávateľom a automatický zápis do ERP alebo účtovného systému.",
        "problem_statement": "Účtovníčky a back-office ručne prepisujú stovky dokladov mesačne. Prepisovanie je pomalé, chybovosť sa pohybuje okolo 3 – 5 % a uzávierka sa každý mesiac naťahuje.",
        "detailed_description": "Riešenie kombinuje OCR s jazykovým modelom, ktorý rozumie štruktúre slovenských a českých dokladov. Overuje IČO a DIČ, páruje doklady s objednávkami, kontroluje sumy a DPH a do ERP zapisuje iba doklady, ktoré prešli validáciou. Výnimky čakajú na schválenie v prehľadnej fronte.",
        "workflow_steps": [
            "Príjem dokladu z e-mailu, skenera alebo zdieľaného priečinka",
            "OCR a extrakcia polí (dodávateľ, IČO, sumy, DPH, splatnosť) cez LLM",
            "Validácia voči registru, objednávkam a pravidlám účtovania",
            "Automatický zápis do ERP alebo odoslanie výnimky na schválenie",
            "Archivácia dokladu a auditný záznam o každom kroku",
        ],
        "tech_stack": ["Python", "Azure Document Intelligence", "OpenAI API", "n8n", "PostgreSQL"],
        "integrations": ["Pohoda", "Money S3 / S5", "SAP Business One", "Helios", "SharePoint"],
        "typical_implementation_time": "4 – 6 týždňov",
        "average_time_saved_label": "Úspora 70 – 90 % času spracovania",
        "starting_price_eur": Decimal("7900"),
    },
    {
        "category": "Automatizácia fakturácie a back-office",
        "name": "AI kontrola a porovnávanie zmlúv",
        "is_featured": False,
        "short_description": "Rýchla analýza zmlúv voči vašim štandardným podmienkam s označením rizikových klauzúl, chýbajúcich ustanovení a odchýlok.",
        "problem_statement": "Právne a obchodné oddelenie kontroluje desiatky zmlúv mesačne ručne. Revízia jedného dokumentu trvá 1 – 3 hodiny a dôležité odchýlky sa ľahko prehliadnu.",
        "detailed_description": "Systém porovná zmluvu s vaším playbookom, zvýrazní rozdiely, vyhodnotí ich riziko a pripraví stručný sumár pre schvaľovateľa. Dokumenty zostávajú vo vašom prostredí v EÚ a nepoužívajú sa na trénovanie modelov.",
        "workflow_steps": [
            "Nahratie zmluvy do zabezpečeného úložiska",
            "Rozdelenie dokumentu na klauzuly a ich klasifikácia",
            "Porovnanie s internými štandardmi a hodnotenie rizika",
            "Vygenerovanie sumáru a návrhov úprav pre právnika",
        ],
        "tech_stack": ["Python", "Claude API", "LangGraph", "PostgreSQL"],
        "integrations": ["SharePoint", "Google Drive", "DocuSign", "Microsoft Teams"],
        "typical_implementation_time": "3 – 4 týždne",
        "average_time_saved_label": "Úspora 50 – 70 % času revízie",
        "starting_price_eur": Decimal("5900"),
    },
    {
        "category": "Firemná znalostná báza (RAG)",
        "name": "Interný firemný AI vyhľadávač nad dokumentmi (RAG)",
        "is_featured": True,
        "short_description": "Firemný AI asistent, ktorý odpovedá na otázky zamestnancov nad smernicami, manuálmi a dokumentáciou – vždy s odkazom na konkrétny zdroj.",
        "problem_statement": "Know-how je rozptýlené v stovkách PDF, wiki stránkach a e-mailoch. Zamestnanci strácajú hodiny týždenne hľadaním informácií a noví kolegovia sa zaúčajú mesiace.",
        "detailed_description": "Dokumenty indexujeme do vektorovej databázy s rešpektovaním prístupových práv. Asistent odpovedá iba na základe vašich dát, cituje zdroje a pri nedostatku informácií to otvorene povie. Beží v EÚ cloude alebo on-premise, dostupný cez web, Slack alebo Microsoft Teams.",
        "workflow_steps": [
            "Napojenie zdrojov (SharePoint, Confluence, Google Drive, PDF)",
            "Spracovanie, rozdelenie a vektorová indexácia dokumentov",
            "Vyhľadanie relevantných pasáží podľa otázky a prístupových práv",
            "Vygenerovanie odpovede s citáciou zdrojov",
            "Zber spätnej väzby a priebežné zlepšovanie presnosti",
        ],
        "tech_stack": ["Python", "Claude API", "pgvector", "LlamaIndex", "FastAPI", "Docker"],
        "integrations": ["SharePoint", "Confluence", "Google Drive", "Slack / Teams"],
        "typical_implementation_time": "4 – 6 týždňov",
        "average_time_saved_label": "Úspora 4 – 6 hodín týždenne na zamestnanca",
        "starting_price_eur": Decimal("8900"),
    },
    {
        "category": "Firemná znalostná báza (RAG)",
        "name": "AI asistent pre onboarding nových zamestnancov",
        "is_featured": False,
        "short_description": "Digitálny mentor, ktorý novým kolegom vysvetlí procesy, nástroje a interné pravidlá a odbremení seniorných kolegov od opakovaných otázok.",
        "problem_statement": "Zaúčanie nového zamestnanca trvá 2 – 3 mesiace a výrazne vyťažuje seniorov, ktorí opakovane odpovedajú na rovnaké otázky.",
        "detailed_description": "Asistent kombinuje firemnú znalostnú bázu so štruktúrovaným onboardingovým plánom. Sleduje postup nováčika, pripomína úlohy a manažérovi poskytuje prehľad o tom, kde nováčikovia najčastejšie potrebujú pomoc.",
        "workflow_steps": [
            "Import onboardingových materiálov a procesných manuálov",
            "Personalizovaný plán podľa pozície a oddelenia",
            "Odpovede na otázky v Slacku alebo Teams s citáciou zdrojov",
            "Reporting pokroku a najčastejších otázok pre manažéra",
        ],
        "tech_stack": ["Python", "OpenAI API", "pgvector", "n8n"],
        "integrations": ["Microsoft Teams", "Slack", "Notion", "BambooHR"],
        "typical_implementation_time": "3 – 4 týždne",
        "average_time_saved_label": "Skrátenie zaúčania o 30 – 40 %",
        "starting_price_eur": Decimal("4900"),
    },
    {
        "category": "AI Obchodný tím & Lead Generation",
        "name": "Automatizovaný B2B prospekting a personalizácia e-mailov",
        "is_featured": True,
        "short_description": "Pipeline, ktorá vyhľadá firmy podľa vášho ideálneho profilu, obohatí kontakty, pripraví personalizované oslovenie a výsledky zapíše do CRM.",
        "problem_statement": "Obchodníci trávia až 40 % času hľadaním kontaktov a písaním e-mailov namiesto rozhovorov s klientmi. Generické šablóny majú nízku mieru odpovedí.",
        "detailed_description": "Agent analyzuje web, verejné registre a novinky o cieľovej firme a pripraví prvý kontakt šitý na mieru. Obchodník e-mail iba schváli alebo upraví. Všetko prebieha v súlade s GDPR – s evidenciou právneho základu a jednoduchým odhlásením.",
        "workflow_steps": [
            "Definícia ideálneho profilu zákazníka (odvetvie, veľkosť, región)",
            "Vyhľadanie firiem a obohatenie údajov z verejných zdrojov",
            "Analýza firmy cez LLM a návrh personalizovaného oslovenia",
            "Schválenie obchodníkom a odoslanie sekvencie",
            "Synchronizácia odpovedí a stavu leadu do CRM",
        ],
        "tech_stack": ["Python", "Claude API", "n8n", "Apollo API", "REST API"],
        "integrations": ["Pipedrive", "HubSpot", "Salesforce", "Lemlist"],
        "typical_implementation_time": "2 – 4 týždne",
        "average_time_saved_label": "Úspora 10 – 15 hodín týždenne na obchodníka",
        "starting_price_eur": Decimal("4500"),
    },
    {
        "category": "AI Obchodný tím & Lead Generation",
        "name": "Prepis stretnutí a automatická synchronizácia do CRM",
        "is_featured": True,
        "short_description": "Automatický prepis obchodných a interných stretnutí, štruktúrovaný sumár, úlohy a ďalšie kroky priamo v CRM a projektovom nástroji.",
        "problem_statement": "Po každom stretnutí obchodník 15 – 30 minút spisuje poznámky a aktualizuje CRM. Časť informácií sa nikdy nezapíše a manažment nemá presný obraz o pipeline.",
        "detailed_description": "Riešenie prepíše nahrávku v slovenčine aj češtine, identifikuje rečníkov, vytvorí sumár, záväzky a ďalšie kroky a aktualizuje príslušnú príležitosť v CRM. Nahrávky sú spracované v EÚ a po spracovaní automaticky zmazané podľa vašej politiky.",
        "workflow_steps": [
            "Nahratie záznamu z Teams, Zoom alebo Google Meet",
            "Prepis reči na text s rozlíšením rečníkov",
            "Sumarizácia, extrakcia úloh a ďalších krokov cez LLM",
            "Aktualizácia príležitosti a úloh v CRM",
        ],
        "tech_stack": ["Python", "Whisper", "Claude API", "Make"],
        "integrations": ["Microsoft Teams", "Zoom", "Google Meet", "Pipedrive", "HubSpot"],
        "typical_implementation_time": "2 – 3 týždne",
        "average_time_saved_label": "Úspora 20 – 30 minút po každom stretnutí",
        "starting_price_eur": Decimal("3500"),
    },
    {
        "category": "Integrácie systémov (n8n / Make / Custom API)",
        "name": "Synchronizácia objednávok medzi e-shopom, skladom a ERP",
        "is_featured": True,
        "short_description": "Robustné prepojenie e-shopu, skladového systému, dopravcov a ERP s automatickým spracovaním objednávok, stavov a faktúr.",
        "problem_statement": "Objednávky sa medzi systémami prenášajú ručne alebo cez nespoľahlivé exporty. Vznikajú duplicity, chyby v zásobách a oneskorené expedície.",
        "detailed_description": "Navrhneme a nasadíme integračnú vrstvu na n8n alebo vlastnom API s frontami, opakovaním pri chybách, monitoringom a upozorneniami. Každá transakcia je dohľadateľná a systém zvládne aj sezónne špičky.",
        "workflow_steps": [
            "Zachytenie novej objednávky cez webhook z e-shopu",
            "Validácia dát a kontrola dostupnosti na sklade",
            "Zápis do ERP a vytvorenie zásielky u dopravcu",
            "Spätná aktualizácia stavu a notifikácia zákazníka",
            "Monitoring, logovanie a upozornenia pri chybách",
        ],
        "tech_stack": ["n8n", "Node.js", "PostgreSQL", "Redis", "REST API", "Docker"],
        "integrations": ["Shoptet", "Shopify", "Pohoda", "Packeta", "DPD / GLS"],
        "typical_implementation_time": "3 – 5 týždňov",
        "average_time_saved_label": "Úspora 80 – 95 % ručného prenosu dát",
        "starting_price_eur": Decimal("5500"),
    },
    {
        "category": "AI Školenia a firemné workshopy",
        "name": "AI workshop pre manažment a tímy",
        "is_featured": False,
        "short_description": "Jednodňový praktický workshop: bezpečné používanie generatívnej AI, prompt engineering na vašich reálnych úlohách a mapa procesov vhodných na automatizáciu.",
        "problem_statement": "Zamestnanci používajú AI nástroje nekoordinovane, bez pravidiel pre prácu s firemnými dátami. Manažment nevie, kde AI prinesie reálnu hodnotu.",
        "detailed_description": "Workshop pripravujeme na mieru podľa vašich procesov. Účastníci odchádzajú s overenými postupmi, internými pravidlami pre bezpečné používanie AI v súlade s EU AI Act a GDPR a s prioritizovaným zoznamom príležitostí na automatizáciu.",
        "workflow_steps": [
            "Úvodný rozhovor a analýza potrieb tímu",
            "Príprava cvičení na reálnych firemných úlohách",
            "Workshop: bezpečnosť, prompt engineering, praktické cvičenia",
            "Mapa príležitostí na automatizáciu a odporúčania",
        ],
        "tech_stack": ["ChatGPT Enterprise", "Claude", "Microsoft Copilot", "n8n"],
        "integrations": ["Microsoft 365", "Google Workspace"],
        "typical_implementation_time": "1 – 2 týždne prípravy",
        "average_time_saved_label": "Úspora 2 – 5 hodín týždenne na účastníka",
        "starting_price_eur": Decimal("1900"),
    },
]

CASE_STUDIES = [
    {
        "title": "Automatizácia spracovania 4 500 objednávok mesačne pre slovenský e-commerce",
        "client_industry": "E-commerce & Logistika",
        "client_descriptor": "Slovenský e-shop s domácimi potrebami, 38 zamestnancov",
        "problem_before": "Tri pracovníčky back-office ručne prenášali objednávky zo štyroch predajných kanálov do ERP a skladového systému. Pri sezónnych špičkách sa expedícia oneskorovala o 2 – 3 dni a chybovosť dosahovala 4 %.",
        "ai_solution_built": "Integračná vrstva na n8n prepájajúca e-shop, marketplace, sklad a ERP, doplnená o AI agenta, ktorý rieši výnimky (nejasné adresy, nekompletné objednávky) a odpovedá zákazníkom na otázky o stave objednávky.",
        "result_after": "Objednávky sa spracúvajú do 5 minút od prijatia, chybovosť klesla pod 0,3 % a back-office sa presunul na reklamácie a starostlivosť o kľúčových odberateľov.",
        "hours_saved_monthly": 160,
        "cost_reduction_percent": 68,
        "payback_months": Decimal("2.5"),
        "tools_used": ["n8n", "OpenAI API", "PostgreSQL", "Shoptet API", "Pohoda"],
        "is_featured": True,
    },
    {
        "title": "AI spracovanie 2 800 prijatých faktúr mesačne pre účtovnú kanceláriu",
        "client_industry": "Účtovníctvo a financie",
        "client_descriptor": "Účtovná kancelária v Bratislave, 120 klientov",
        "problem_before": "Účtovníci ručne prepisovali faktúry klientov do systému Pohoda. Uzávierka sa každý mesiac naťahovala do posledných dní a firma nemohla prijímať nových klientov bez ďalších náborov.",
        "ai_solution_built": "Pipeline na vyťaženie údajov z faktúr (OCR + LLM) s validáciou IČO a DPH, automatickým predkontovaním a frontou výnimiek na schválenie účtovníkom.",
        "result_after": "88 % faktúr prechádza bez ľudského zásahu, uzávierka je hotová o 6 dní skôr a kancelária prevzala 35 nových klientov bez rozširovania tímu.",
        "hours_saved_monthly": 210,
        "cost_reduction_percent": 61,
        "payback_months": Decimal("3.0"),
        "tools_used": ["Python", "Azure Document Intelligence", "Claude API", "Pohoda XML"],
        "is_featured": True,
    },
    {
        "title": "Interný AI asistent nad 12 000 dokumentmi pre developerskú skupinu",
        "client_industry": "Realitná a developerská skupina",
        "client_descriptor": "Developerská skupina pôsobiaca na Slovensku a v Česku",
        "problem_before": "Projektoví manažéri hľadali informácie v tisícoch zmlúv, stavebných povolení a technických správ rozptýlených v SharePointe a e-mailoch. Odpoveď na jednoduchú otázku trvala aj hodinu.",
        "ai_solution_built": "RAG asistent v Microsoft Teams s napojením na SharePoint, rešpektujúci prístupové práva, s citovaním zdrojov a hostingom v EÚ (Azure West Europe).",
        "result_after": "Priemerný čas vyhľadania informácie klesol z 35 minút na menej ako 2 minúty a asistent denne využíva 70 zamestnancov.",
        "hours_saved_monthly": 320,
        "cost_reduction_percent": 45,
        "payback_months": Decimal("4.0"),
        "tools_used": ["Claude API", "pgvector", "LlamaIndex", "Microsoft Graph API", "Azure"],
        "is_featured": True,
    },
    {
        "title": "AI zákaznícka podpora a triedenie dopytov pre výrobcu priemyselných komponentov",
        "client_industry": "Výrobná spoločnosť",
        "client_descriptor": "Výrobca priemyselných komponentov, 240 zamestnancov, export do 18 krajín",
        "problem_before": "Obchodné oddelenie dostávalo denne viac ako 300 technických a cenových dopytov v piatich jazykoch. Odpoveď na dopyt trvala v priemere 2 pracovné dni.",
        "ai_solution_built": "AI agent, ktorý triedi a prekladá prichádzajúce dopyty, vyhľadáva parametre v produktovej dokumentácii, pripravuje návrhy cenových ponúk a zapisuje ich do CRM na schválenie obchodníkom.",
        "result_after": "Priemerná reakčná doba klesla na 3 hodiny, konverzia dopytov na objednávky vzrástla o 22 % a obchodníci sa venujú kľúčovým zákazníkom.",
        "hours_saved_monthly": 280,
        "cost_reduction_percent": 52,
        "payback_months": Decimal("3.5"),
        "tools_used": ["Python", "OpenAI API", "n8n", "Salesforce", "DeepL API"],
        "is_featured": False,
    },
]

TEAM = [
    {
        "full_name": "Ing. Jakub Varga",
        "role_title": "Lead AI Solutions Architect",
        "bio": "Viac ako 10 rokov navrhuje distribuované systémy a dátové platformy. Posledné roky sa venuje výlučne nasadzovaniu LLM agentov do produkcie vo finančnom sektore a v e-commerce. Zodpovedá za architektúru, bezpečnosť a kvalitu každého riešenia.",
        "expertise_tags": ["LLM Agenti", "RAG Architektúra", "Python", "Enterprise Integrácie"],
        "photo_id": "1497366216548-37526070297c",
    },
    {
        "full_name": "Mgr. Lucia Horváthová",
        "role_title": "Head of Process Automation",
        "bio": "Bývalá konzultantka v oblasti optimalizácie procesov pre výrobné a logistické firmy. Vedie procesné audity, mapuje úzke hrdlá a prekladá obchodné ciele do merateľných automatizačných projektov s jasnou návratnosťou.",
        "expertise_tags": ["Procesný audit", "n8n / Make", "ERP integrácie", "ROI analýza"],
        "photo_id": "1497366811353-6870744d04b2",
    },
    {
        "full_name": "Ing. Martin Kováč, PhD.",
        "role_title": "Senior Machine Learning Engineer",
        "bio": "Doktorát z oblasti spracovania prirodzeného jazyka na STU v Bratislave. Špecializuje sa na vyhodnocovanie presnosti modelov, spracovanie slovenských dokumentov a bezpečné nasadenie AI v súlade s EU AI Act.",
        "expertise_tags": ["NLP pre slovenčinu", "Evaluácia LLM", "Document AI", "MLOps"],
        "photo_id": "1531297484001-80022131f5a1",
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovými kategóriami, AI riešeniami, prípadovými štúdiami a tímom (idempotentne)."

    @transaction.atomic
    def handle(self, *args, **options):
        categories = {}
        for order, data in enumerate(CATEGORIES, start=1):
            category, _ = SolutionCategory.objects.update_or_create(
                slug=slugify(data["name"]),
                defaults={**data, "display_order": order},
            )
            categories[category.name] = category

        for order, data in enumerate(SOLUTIONS, start=1):
            payload = {**data, "category": categories[data["category"]], "display_order": order}
            AutomationSolution.objects.update_or_create(slug=slugify(data["name"]), defaults=payload)

        for order, data in enumerate(CASE_STUDIES, start=1):
            CaseStudy.objects.update_or_create(
                slug=slugify(data["title"]), defaults={**data, "display_order": order}
            )

        for order, data in enumerate(TEAM, start=1):
            data = dict(data)
            photo_id = data.pop("photo_id")
            TeamMember.objects.update_or_create(
                full_name=data["full_name"],
                defaults={**data, "photo_url": UNSPLASH.format(id=photo_id), "display_order": order},
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Hotovo – kategórie: {}, riešenia: {}, prípadové štúdie: {}, tím: {}.".format(
                    SolutionCategory.objects.count(),
                    AutomationSolution.objects.count(),
                    CaseStudy.objects.count(),
                    TeamMember.objects.count(),
                )
            )
        )
