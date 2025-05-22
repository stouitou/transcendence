import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState.ts";
import { LanguageContext } from "../globalstate/LanguageContext";
import { t } from "../i18n/translations";
import { fetchProfileData, updateProfileData } from "../services/authService.ts";


export class Home extends BaseComponent<{}> {
  constructor() {
    super({});
  };

  connectedCallback() {
    super.connectedCallback();
    this.loadProfile();
    LanguageContext().subscribe(() => this.render());
    this.render();
  }

  async fetchData() {
    try {
      const profile = await fetchProfileData();
      this.setState({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      });
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    }
  }
  
  async loadProfile() {
    await this.fetchData();
    this.render(); // ✅ render APRES avoir les données
  }

  render() {

    const user = UserContext().user();
    const lang = LanguageContext().getLang();
    this.innerHTML = `
      <section class="min-h-screen px-4 py-8 text-gray-900 dark:text-white">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl font-bold mb-8 text-center">Bienvenue sur GameCentral</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${
              user
                ? `
                  <a href="/dashboard" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">📊</div>
                    <h2 class="text-xl font-semibold mb-1">Dashboard</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${t("dashboard_access", lang)}</p>
                  </a>
                  <a href="/game" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">🎮</div>
                    <h2 class="text-xl font-semibold mb-1">${t("play", lang)}</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${t("play_phrase", lang)}</p>
                  </a>
                  <a href="/profile" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">👤</div>
                    <h2 class="text-xl font-semibold mb-1">${t("profile", lang)}</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${t("profile_phrase", lang)}</p>
                  </a>
                  <a href="/leaderboard" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">🏆</div>
                    <h2 class="text-xl font-semibold mb-1">${t("ranking", lang)}</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${t("ranking_phrase", lang)}</p>
                  </a>
                  <a href="/settings" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">⚙️</div>
                    <h2 class="text-xl font-semibold mb-1">${t("settings", lang)}</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${t("settings_phrase", lang)}</p>
                  </a>
                  <a href="/support" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">❓</div>
                    <h2 class="text-xl font-semibold mb-1">${t("support", lang)}</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${t("support_phrase", lang)}</p>
                  </a>
                `
                : `
                  <a href="/login" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">🔐</div>
                    <h2 class="text-xl font-semibold mb-1">${t("login", lang)}</h2>
                  </a>
                  <a href="/register" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div class="text-4xl mb-3">📝</div>
                    <h2 class="text-xl font-semibold mb-1">${t("register", lang)}</h2>
                  </a>
                `
            }
          </div>
        </div>
      </section>
    `;
  }
}
