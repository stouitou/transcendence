import { Language } from "../frameworks/i18n/types";

type LangListener = (lang: Language) => void;

/**
 * LanguageContext
 * Singleton class to manage the language context
 * @class LanguageContext
 * @property {Language} lang - The current language
 * @property {LangListener[]} listeners - Array of listeners for language changes
 */
class LanguageContext {
	private static instance: LanguageContext;
	private constructor() {	}
	public static getInstance(): LanguageContext {
		if (!LanguageContext.instance) {
		LanguageContext.instance = new LanguageContext();
		}
		return LanguageContext.instance;
	}
  private lang = localStorage.getItem('lang') as Language || 'en';
  private listeners: LangListener[] = [];

  getLang() { return this.lang; }
  setLang(newLang: Language) {
    if (this.lang !== newLang) {
		// console.log("setLang", newLang);
      this.lang = newLang;
	  // Met à jour la langue dans le stockage local
      localStorage.setItem('lang', newLang);
	  // Appelle chaque fonction d'écoute avec la nouvelle langue
      this.listeners.forEach(fn => fn(newLang));
	  // Met à jour l'attribut lang de l'élément racine
      document.documentElement.setAttribute('lang', newLang);
    }
  }
  onChange(fn: LangListener) {
	this.listeners.push(fn);
	// Retourne une fonction pour se désabonner
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== fn);
    }; }

	// Désabonne une fonction d'écoute, a n'utiliser qu'en dehors de la classe BaseComponent
  offChange(fn: LangListener) {
	this.listeners = this.listeners.filter(listener => listener !== fn);
  }
}

export default LanguageContext.getInstance();