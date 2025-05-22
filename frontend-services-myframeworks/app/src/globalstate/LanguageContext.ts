type Language = 'fr' | 'en' | 'es';

let currentLang: Language = (localStorage.getItem("lang") as Language) || 'fr';
let listeners: (() => void)[] = [];

export const LanguageContext = () => ({
  getLang: (): Language => currentLang,

  setLang: (lang: Language) => {
    if (currentLang !== lang) {
      currentLang = lang;
      localStorage.setItem("lang", lang);
      listeners.forEach((cb) => cb());
    }
  },

  subscribe: (cb: () => void) => {
    listeners.push(cb);
  },

  unsubscribe: (cb: () => void) => {
    listeners = listeners.filter((fn) => fn !== cb);
  },
});
