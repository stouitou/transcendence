import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState.ts";
import { LanguageContext } from "../globalstate/LanguageContext";
import { t } from "../i18n/translations";
import { fetchProfileData, updateProfileData } from "../services/authService.ts";

interface Player {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

export class Leaderboard extends BaseComponent<{}> {
  constructor() {
    super({});
  }

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
    if (!user) {
      this.innerHTML = `<p class="text-center text-lg text-gray-700 dark:text-gray-300 mt-10">Veuillez vous connecter pour voir le classement.</p>`;
      return;
    }
    const lang = LanguageContext().getLang();

    // Classement fictif
    const leaderboard: Player[] = [
      { rank: 1, name: "Alice", score: 1890, avatar: "../../../../ws-service/app/uploads/3-avatartest.jpg" },
      { rank: 2, name: "Bob", score: 1720, avatar: "/avatars/bob.png" },
      { rank: 3, name: "Clara", score: 1650, avatar: "/avatars/clara.png" },
      { rank: 4, name: "David", score: 1580, avatar: "/avatars/david.png" },
      { rank: 5, name: "Emma", score: 1520, avatar: "/avatars/emma.png" },
    ];

    this.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-10 text-gray-900 dark:text-white">
        <h1 class="text-3xl font-bold mb-6 text-center">${t("players_rank", lang)}</h1>
        <div class="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden">
          <table class="w-full table-auto">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="text-left px-6 py-3">#</th>
                <th class="text-left px-6 py-3">${t("players", lang)}</th>
                <th class="text-left px-6 py-3">${t("score", lang)}</th>
              </tr>
            </thead>
            <tbody>
              ${leaderboard
        .map(
          (player) => `
                <tr class="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td class="px-6 py-4 font-semibold">${player.rank}</td>
                  <td class="px-6 py-4 flex items-center gap-3">
                    <img src="${player.avatar}" alt="${player.name}" class="w-8 h-8 rounded-full object-cover" />
                    ${player.name}
                  </td>
                  <td class="px-6 py-4">${player.score}</td>
                </tr>
              `
        )
        .join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }
}
