export const languages = ['fr', 'en', 'es'] as const;
export type Language = typeof languages[number];