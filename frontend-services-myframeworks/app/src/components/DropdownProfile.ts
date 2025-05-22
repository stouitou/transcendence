import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState.ts";
import { logoutUser } from "../services/authService.ts";
import { LanguageContext } from "../globalstate/LanguageContext";
import { t } from "../i18n/translations";


export class DropdownProfile extends BaseComponent<{
  isDrop: boolean;
  avatar: string;
  name: string;
  email: string;
}> {
  constructor() {
    const user = UserContext().user();
    super({
      isDrop: false,
      avatar: user?.avatar || "",
      name: user?.name || "",
      email: user?.email || "",
    });
  }

  connectedCallback() {
    const user = UserContext().user();
    if (!user) {
      this.innerHTML = "";
      return;
    }
    LanguageContext().subscribe(() => this.render());
    this.render();
  }

  toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    this.setState({ isDrop: !this.state.isDrop });

    if (!this.state.isDrop) {
      document.removeEventListener("click", this.handleOutsideClick);
    } else {
      document.addEventListener("click", this.handleOutsideClick);
    }
    this.render();
  };

  handleOutsideClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this.setState({ isDrop: false });
      document.removeEventListener("click", this.handleOutsideClick);
    }
    this.render();
  };

  handleSignOut = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  render() {
    const { isDrop, avatar, name, email } = this.state;
    const lang = LanguageContext().getLang();
  
    this.innerHTML = `
      <div class="relative inline-block text-left">
        <button id="avatar-btn" class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
          <img src="${avatar}" alt="Avatar utilisateur" class="w-8 h-8 rounded-full object-cover" />
        </button>
  
        ${isDrop
          ? `
          <div id="dropdown" class="dropdown-menu transition ease-out duration-200 transform opacity-0 scale-95 absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg divide-y divide-gray-100 dark:divide-gray-600 z-50">
            <div class="flex items-center p-4">
              <img src="${avatar}" alt="Avatar" class="w-10 h-10 rounded-full mr-3 object-cover">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">${name}</p>
                <p class="text-sm text-gray-500 dark:text-gray-300">${email}</p>
              </div>
            </div>
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li><a href="/profile" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${t("profile", lang)}</a></li>
              <li><a href="/messages" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${t("messages", lang)}</a></li>
              <li><a href="/settings" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${t("settings", lang)}</a></li>
              <li><a href="/dashboard" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${t("dashboard", lang)}</a></li>
              <li><a href="/leaderboard" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${t("ranking", lang)}</a></li>
              <li><button id="sign-out-btn" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${t("logout", lang)}</button></li>
            </ul>
          </div>`
          : ""
        }
      </div>
    `;
  
    const avatarBtn = this.querySelector("#avatar-btn");
    if (avatarBtn) {
      avatarBtn.addEventListener("click", this.toggleDropdown);
    }
  
    if (isDrop) {
      const dropdown = this.querySelector("#dropdown");
      if (dropdown) {
        requestAnimationFrame(() => {
          dropdown.classList.remove("opacity-0", "scale-95");
          dropdown.classList.add("opacity-100", "scale-100");
        });
      }
  
      const signOutBtn = this.querySelector("#sign-out-btn");
      if (signOutBtn) {
        signOutBtn.addEventListener("click", this.handleSignOut);
      }
    }
  }
}
