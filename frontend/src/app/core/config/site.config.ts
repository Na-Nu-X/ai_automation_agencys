/**
 * White-label configuration.
 *
 * Every agency-specific detail (brand, contact data, legal identifiers,
 * compliance copy, trust metrics) lives here so the whole site can be
 * rebranded for a new client by editing this single file. Colours and fonts
 * are rebranded via the CSS custom properties in `src/styles/_base.scss`.
 *
 * NOTE: The values below are demo placeholders – replace them before launch.
 */

export interface SocialLink {
  label: string;
  url: string;
  icon: 'linkedin' | 'github' | 'youtube' | 'x';
}

export interface TrustMetric {
  value: string;
  label: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    legalName: string;
    /** Wordmark is rendered as `primary` + accent-coloured `secondary`. */
    wordmark: { primary: string; secondary: string };
    tagline: string;
    description: string;
  };
  contact: {
    email: string;
    phone: string;
    phoneHref: string;
    address: { street: string; city: string; country: string };
    officeHours: string;
    responseTime: string;
  };
  legal: {
    ico: string;
    dic: string;
    icDph?: string;
    registry: string;
  };
  compliance: {
    shortNote: string;
    gdprNote: string;
    hostingNote: string;
    badges: string[];
  };
  techStack: string[];
  trustMetrics: TrustMetric[];
  social: SocialLink[];
}

export const SITE_CONFIG: SiteConfig = {
  brand: {
    name: 'Vektor Labs',
    legalName: 'Vektor Labs s. r. o.',
    wordmark: { primary: 'vektor', secondary: 'labs' },
    tagline: 'AI automatizačná agentúra a vývoj vlastných AI agentov',
    description:
      'Navrhujeme, vyvíjame a prevádzkujeme AI agentov a automatizácie, ktoré slovenským a európskym firmám merateľne šetria čas a náklady – bezpečne a v súlade s GDPR.',
  },
  contact: {
    email: 'audit@vektorlabs.sk',
    phone: '+421 900 000 000',
    phoneHref: '+421900000000',
    address: {
      street: 'Karadžičova 16',
      city: '821 08 Bratislava',
      country: 'Slovensko',
    },
    officeHours: 'Po – Pi, 8:30 – 17:30',
    responseTime: 'Na dopyty odpovedáme do 1 pracovného dňa.',
  },
  legal: {
    ico: '12 345 678',
    dic: '2120000000',
    icDph: 'SK2120000000',
    registry: 'Zapísaná v Obchodnom registri Mestského súdu Bratislava III, oddiel Sro, vložka č. 000000/B',
  },
  compliance: {
    shortNote: 'Dáta spracúvame výhradne v EÚ, v súlade s GDPR a EU AI Act.',
    gdprNote:
      'Všetky riešenia navrhujeme v súlade s GDPR a nariadením EU AI Act. Vaše firemné dáta zostávajú v dátových centrách v EÚ, nepoužívajú sa na trénovanie verejných modelov a ku každému projektu uzatvárame zmluvu o spracúvaní osobných údajov (DPA).',
    hostingNote:
      'Hosting v EÚ (Frankfurt, Amsterdam) alebo on-premise na vašej infraštruktúre. Šifrovanie dát pri prenose aj v pokoji.',
    badges: ['GDPR', 'EU AI Act', 'Hosting v EÚ', 'DPA zmluva'],
  },
  techStack: [
    'Python',
    'Claude API',
    'OpenAI API',
    'n8n',
    'Make',
    'LangGraph',
    'PostgreSQL',
    'pgvector',
    'Docker',
    'Azure',
  ],
  trustMetrics: [
    { value: '45+', label: 'nasadených AI riešení v produkcii' },
    { value: '14 200 h', label: 'ušetrených klientom za posledný rok' },
    { value: '3,2 mes.', label: 'priemerná návratnosť investície' },
    { value: '100 %', label: 'dát spracovaných v EÚ' },
  ],
  social: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/', icon: 'linkedin' },
    { label: 'GitHub', url: 'https://github.com/', icon: 'github' },
    { label: 'YouTube', url: 'https://www.youtube.com/', icon: 'youtube' },
  ],
};
