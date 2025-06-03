import { BaseComponent } from "../frameworks/base-component";

export class Settings extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
    this.applyCurrentTheme();

    const themeSelect = this.querySelector('#theme') as HTMLSelectElement;
    if (themeSelect) {
      themeSelect.addEventListener('change', this.handleThemeChange.bind(this));
    }

    // Pour écouter un changement du thème en dehors (ex: depuis NavBar)
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
      // 'system'
      localStorage.setItem('color-theme', 'system');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.toggle('dark', prefersDark);
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  render() {
    this.innerHTML = `
      <section class="px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">${this.t("SETTINGS.TITLE")}</h1>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium mb-1" for="theme">${this.t("THEME.TITLE")}</label>
              <select id="theme" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                <option value="light">${this.t("THEME.LIGHT")}</option>
                <option value="dark">${this.t("THEME.DARK")}</option>
              </select>
            </div>

            <div>
              <language-component></language-component>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
