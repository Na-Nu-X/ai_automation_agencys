/** Option lists that must stay in sync with the Django model choices. */

export interface Choice<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export type InquiryType = 'ai_audit' | 'konkretne_riesenie' | 'firemne_skolenie';

export const INQUIRY_TYPES: Choice<InquiryType>[] = [
  {
    value: 'ai_audit',
    label: 'Bezplatný AI audit procesov',
    description: 'Zmapujeme procesy a ukážeme, kde AI prinesie najväčšiu úsporu.',
  },
  {
    value: 'konkretne_riesenie',
    label: 'Dopyt na konkrétne AI riešenie',
    description: 'Viete, čo chcete automatizovať, a potrebujete návrh a cenu.',
  },
  {
    value: 'firemne_skolenie',
    label: 'AI workshop pre tím',
    description: 'Praktické školenie bezpečného a efektívneho používania AI.',
  },
];

export const TEAM_SIZES: Choice[] = [
  { value: '1_10', label: '1 – 10 zamestnancov' },
  { value: '11_50', label: '11 – 50 zamestnancov' },
  { value: '51_250', label: '51 – 250 zamestnancov' },
  { value: '250_plus', label: '250+ zamestnancov' },
];

export const BOTTLENECKS: Choice[] = [
  { value: 'zakaznicka_podpora', label: 'Zákaznícka podpora' },
  { value: 'administrativa', label: 'Administratíva a faktúry' },
  { value: 'obchod_marketing', label: 'Obchod a marketing' },
  { value: 'interne_procesy', label: 'Interné procesy' },
  { value: 'znalosti', label: 'Práca s dokumentmi a znalosťami' },
  { value: 'ine', label: 'Iné' },
];
