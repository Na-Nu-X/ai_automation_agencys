/** Static marketing content (Slovak). Edit freely per client. */
import { IconName } from '../../shared/components/icon/icon.component';

export interface ProcessStep {
  number: string;
  title: string;
  duration: string;
  summary: string;
  deliverables: string[];
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Procesný & AI audit',
    duration: '1 – 2 týždne',
    summary:
      'Zmapujeme vaše procesy, dátové toky a systémy. Identifikujeme úlohy s najvyšším potenciálom úspory a overíme kvalitu dostupných dát.',
    deliverables: ['Mapa procesov a úzkych hrdiel', 'Prioritizovaný zoznam príležitostí', 'Posúdenie dát a rizík'],
  },
  {
    number: '02',
    title: 'Návrh architektúry a ROI',
    duration: '1 týždeň',
    summary:
      'Navrhneme technickú architektúru, výber modelov a integrácií. Dostanete pevnú cenu, harmonogram a výpočet návratnosti investície.',
    deliverables: ['Technický návrh riešenia', 'Pevná cenová ponuka', 'Business case s ROI'],
  },
  {
    number: '03',
    title: 'Vývoj, testovanie a integrácia',
    duration: '2 – 6 týždňov',
    summary:
      'Vyvíjame v krátkych iteráciách s týždennými ukážkami. Presnosť AI meriame na vašich reálnych dátach ešte pred spustením.',
    deliverables: ['Týždenné demo a reporting', 'Evaluácia presnosti na reálnych dátach', 'Napojenie na CRM / ERP'],
  },
  {
    number: '04',
    title: 'Nasadenie, zaškolenie a podpora',
    duration: 'Priebežne',
    summary:
      'Riešenie nasadíme do produkcie, zaškolíme tím a ďalej monitorujeme výkon, náklady a kvalitu odpovedí. Systém priebežne zlepšujeme.',
    deliverables: ['Produkčné nasadenie s monitoringom', 'Zaškolenie a dokumentácia', 'SLA podpora a optimalizácia'],
  },
];

export interface FeatureItem {
  icon: IconName;
  title: string;
  text: string;
}

export const SECURITY_PILLARS: FeatureItem[] = [
  {
    icon: 'server',
    title: 'Dáta zostávajú v EÚ',
    text: 'Prevádzka v dátových centrách v EÚ alebo on-premise na vašej infraštruktúre. Žiadny prenos dát mimo EHP bez vášho súhlasu.',
  },
  {
    icon: 'lock',
    title: 'Žiadne trénovanie na vašich dátach',
    text: 'Využívame enterprise API s nulovou retenciou dát. Vaše dokumenty sa nikdy nepoužijú na trénovanie verejných modelov.',
  },
  {
    icon: 'shield',
    title: 'GDPR a EU AI Act',
    text: 'Ku každému projektu uzatvárame DPA, pripravujeme posúdenie rizík a dokumentáciu požadovanú nariadením EU AI Act.',
  },
  {
    icon: 'eye',
    title: 'Auditovateľnosť a kontrola',
    text: 'Každé rozhodnutie AI je logované. Prístupové práva, ľudské schválenie citlivých krokov a úplná dohľadateľnosť.',
  },
];

export const ENGINEERING_PRINCIPLES: FeatureItem[] = [
  {
    icon: 'target',
    title: 'Merateľný výsledok, nie experiment',
    text: 'Každý projekt začína definíciou metrík – ušetrené hodiny, chybovosť, reakčná doba. Úspech vyhodnocujeme na číslach.',
  },
  {
    icon: 'layers',
    title: 'Produkčná architektúra',
    text: 'Fronty, opakovanie pri chybách, monitoring, logovanie a fallback na človeka. Stavíme systémy, ktoré bežia roky.',
  },
  {
    icon: 'gauge',
    title: 'Evaluácia pred nasadením',
    text: 'Presnosť modelov testujeme na stovkách vašich reálnych prípadov. Do produkcie ide iba to, čo prejde dohodnutým prahom.',
  },
  {
    icon: 'plug',
    title: 'Bez vendor lock-in',
    text: 'Kód a dokumentácia patria vám. Riešenia staviame modulárne, aby ste mohli zmeniť model či poskytovateľa bez prepisovania.',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Koľko stojí nasadenie AI?',
    answer:
      'Úvodný procesný audit je bezplatný. Menšie automatizácie (napr. triedenie e-mailov či prepis stretnutí do CRM) začínajú od 3 500 €, komplexné AI agenti napojení na ERP alebo firemná znalostná báza sa pohybujú od 7 000 do 25 000 €. Vždy dostanete pevnú cenu a výpočet návratnosti – väčšina našich projektov sa vráti do 2 až 6 mesiacov.',
  },
  {
    question: 'Sú naše firemné dáta v bezpečí?',
    answer:
      'Áno. Dáta spracúvame výhradne v EÚ (alebo priamo na vašich serveroch), využívame enterprise API s nulovou retenciou a vaše dáta sa nikdy nepoužívajú na trénovanie modelov. Uzatvárame zmluvu o spracúvaní osobných údajov (DPA), šifrujeme dáta pri prenose aj v pokoji a nastavujeme prístupové práva podľa vašich rolí.',
  },
  {
    question: 'Napojíte AI na náš súčasný ERP/CRM systém?',
    answer:
      'Áno, integrácie sú jadrom našej práce. Bežne sa napájame na Pohodu, Money S3/S5, SAP Business One, Helios, Pipedrive, HubSpot, Salesforce, Microsoft 365, Shoptet či Shopify. Ak systém ponúka API, databázový prístup alebo aspoň export, dokážeme ho do automatizácie zapojiť.',
  },
  {
    question: 'Ako dlho trvá implementácia?',
    answer:
      'Jednoduchšie automatizácie nasadzujeme za 2 – 3 týždne, komplexnejšie AI agenty s viacerými integráciami za 4 – 8 týždňov. Prvé funkčné demo na vašich dátach zvyčajne vidíte už po druhom týždni.',
  },
  {
    question: 'Čo ak AI urobí chybu?',
    answer:
      'Každé riešenie navrhujeme s kontrolnými mechanizmami: validácia výstupov, prahy istoty a eskalácia na človeka pri nejasných prípadoch. Citlivé kroky (napr. platby či odoslanie ponuky) vždy schvaľuje človek. Presnosť priebežne monitorujeme a systém zlepšujeme.',
  },
  {
    question: 'Potrebujeme vlastný IT tím?',
    answer:
      'Nie. Postaráme sa o návrh, vývoj, nasadenie aj prevádzku. Ak máte interných vývojárov, radi s nimi spolupracujeme a odovzdáme im kompletnú dokumentáciu a zdrojový kód.',
  },
];
