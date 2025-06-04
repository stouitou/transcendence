import { BaseComponent } from "../frameworks/base-component";

export class Settings extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">${this.t("SETTINGS.TITLE")}</h1>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div class="relative">
              <label class="block text-sm font-medium mb-1" for="theme">${this.t("THEME.TITLE")}</label>
              <select id="theme" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                <option value="light">${this.t("THEME.LIGHT")}</option>
                <option value="dark">${this.t("THEME.DARK")}</option>
                <option value="system">${this.t("THEME.SYSTEM")}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"/>
                </svg>
              </span>
            </div>

            <div>
              <language-component></language-component>
            </div>
          </div>
        </div>
      </section>
    `;

    this.applyCurrentTheme();
    this.attachListeners();
  }

  attachListeners() {
    const themeSelect = this.querySelector('#theme') as HTMLSelectElement;
    if (themeSelect) {
      themeSelect.addEventListener('change', this.handleThemeChange.bind(this));
    }

    // Reapplique automatiquement si "system" change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const storedTheme = localStorage.getItem('color-theme');
      if (storedTheme === 'system') {
        this.setTheme('system');
      }
    });
  }

  applyCurrentTheme() {
    const stored = localStorage.getItem('color-theme') || 'system';
    const themeSelect = this.querySelector('#theme') as HTMLSelectElement;
    if (themeSelect) themeSelect.value = stored;
    this.setTheme(stored);
  }

  handleThemeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    localStorage.setItem('color-theme', value);
    this.setTheme(value);
  }

  setTheme(theme: string) {
    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    } else {
      localStorage.setItem('color-theme', 'system');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.toggle('dark', prefersDark);
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }
}
