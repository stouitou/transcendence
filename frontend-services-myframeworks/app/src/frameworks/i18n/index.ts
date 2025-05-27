import { en } from '../../i18n/en';
import { fr } from '../../i18n/fr';

export const languages = ['en', 'fr'] as const;
export type Language = typeof languages[number];

export const translations = { en, fr };

// Génère tous les chemins de clés possibles (ex: 'PROFILE.TITLE')
type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends object
    ? Join<K, NestedKeys<T[K]>>
    : K
}[keyof T & string];

export type TranslationKey = NestedKeys<typeof en>;

// Utilitaire d'accès
export function t(key: TranslationKey, lang: Language): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  for (const k of keys) value = value?.[k];
  if (typeof value === 'string') return value;
  // fallback anglais
  value = translations['en'];
  for (const k of keys) value = value?.[k];
  return typeof value === 'string' ? value : key;
}