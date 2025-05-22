import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { get2FADetail, TwoFA } from "../services/api.2fa";
import { User } from '../types/types';

export class ProfilePage extends BaseComponent<{user: User | null,twoFa: TwoFA | null}> {
  constructor() {
    super({user: null,twoFa: null});
  }

  handleListenerProfileUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    this.state.user = customEvent.detail.profileData;
    this.render();
    this.fetch2FADetails().then(() => {
    });
  };

  connectedCallback() {
    this.state.user = UserContext().user();
    this.render();
    this.fetch2FADetails().then(() => {
    //  console.log("2FA details fetched");
    });
    this.listenCustomEvent("profile-data-updated", this.handleListenerProfileUpdate.bind(this));
  }

  async fetch2FADetails() {
    const { user } = this.state;
    if (!user) return;

    try {
      const data = await get2FADetail();
      this.setState({ ...this.state, twoFa: data ?? null });
    //  console.log("2FA data:", data);
     this.update2FaRender();
    } catch (error) {
      console.error("Error fetching 2FA details:", error);
    }
  }

  render() {
    const { user } = this.state;
    if (!user) {
      this.innerHTML = ` 
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading... waiting ProfileData</span>
        </div>
        `;
      return;
    }
    this.innerHTML = `
      <section class=" px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Mon Profil</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div class="flex items-center space-x-4">
              <img referrerPolicy="no-referrer"
                    src=${user.avatar ==""?undefined:user.avatar}
                    alt="Avatar"
                    class="w-16 h-16 rounded-full object-cover">
              <div>
                <h2 class="text-lg font-semibold">${user.name}</h2>
                <br>
                <div id="twofa-display-status"></div>
              </div>
            </div>

            <a href="/profile/edit" class="flex justify-end">
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Mettre à jour</button>
            </a>
          </div>
        </div>
      </section>
    `;
    this.update2FaRender();
  }
  
  update2FaRender() {
    const { twoFa } = this.state;
    const twoFaDisplayStatus = this.querySelector("#twofa-display-status");
    if (twoFaDisplayStatus) {
      if (twoFa && twoFa.provider !== "local") {
        twoFaDisplayStatus.innerHTML = `<p class="text-sm text-gray-500">Provider: ${twoFa.provider}</p>`;
      } else {
        twoFaDisplayStatus.innerHTML = `
        <p class="text-lg font-bold">Two-Factor Authentication 
          ${twoFa?.two_factor_auth ? `<span class="text-green-500">enable</span>` : `<span class="text-red-500">disable</span>`}
          </p>
          <span class="text-sm text-gray-500">(${twoFa?.two_factor_auth ? "You can disable it in your profile settings." : "You can enable it in your profile settings."})</span>
         `;
      }
    }
  }
}
