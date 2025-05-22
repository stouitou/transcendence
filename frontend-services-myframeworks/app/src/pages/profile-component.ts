import { BaseComponent } from "../frameworks/base-component.ts";
import { UserContext } from "../globalstate/GlobalState.ts";
import { fetchProfileData, updateProfileData } from "../services/authService.ts";
import { LanguageContext } from "../globalstate/LanguageContext";
import { t } from "../i18n/translations";


type ProfileState = {
  name: string;
  email: string;
  avatar: string;
  isEditing: boolean;
  avatarFile: File | null;
};

export class ProfilePage extends BaseComponent<ProfileState> {
  constructor() {
    const user = UserContext().user();
    super({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '../../../../ws-service/app/uploads/3-avatartest.jpg',
      isEditing: false,
      avatarFile: null
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadProfile();
    LanguageContext().subscribe(() => this.render());
    this.render();
  }
  
  async loadProfile() {
    await this.fetchData();
    this.render(); // ✅ render APRES avoir les données
  }
  


  async fetchData() {
    const lang = LanguageContext().getLang();

    try {
      const profile = await fetchProfileData();
      this.setState({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      });
    } catch (error) {
      console.error(t("error_profile_loading", lang), error);
    }
  }

  toggleEdit = () => {
    this.setState({ isEditing: !this.state.isEditing });
    this.render();
  }

  handleChange = (key: keyof ProfileState, value: string) => {
    this.setState({ ...this.state, [key]: value });
  }

  handleAvatarChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (file) {
      this.setState({ avatarFile: file, avatar: URL.createObjectURL(file) });
    }
  }

  handleSave = async () => {
    const lang = LanguageContext().getLang();

    try {
      const formData = new FormData();
      formData.append("name", this.state.name);
      if (this.state.email)
        formData.append("email", this.state.email);
      if (this.state.avatarFile) {
        formData.append("avatar", this.state.avatarFile);
      }

      await updateProfileData(formData);
      this.setState({ isEditing: false, avatarFile: null });
      this.render();
    } catch (error) {
      console.error(t("error_save", lang), error);
      this.setState({ isEditing: false, avatarFile: null });
      alert(t("error_coming", lang));
      this.render();
    }
  }

  render() {
    
    const { name, email, avatar, isEditing } = this.state;
    const lang = LanguageContext().getLang();

    this.innerHTML = `
    
      <section class="px-4 py-8 text-gray-900 dark:text-white">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">${t("profile", lang)}</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div class="flex items-center space-x-4">
              <img src="${avatar}" alt="Avatar" class="w-16 h-16 rounded-full object-cover">
              <div>
                <h2 class="text-lg font-semibold">${name}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">${email}</p>
              </div>
            </div>

            ${isEditing
        ? `
                  <div>
                    <label class="block text-sm font-medium mb-1" for="avatar">${t("change_avatar", lang)}</label>
                    <input id="avatar" type="file" accept="image/*" class="block w-full text-sm text-gray-500 dark:text-gray-400"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1" for="name">${t("name", lang)}</label>
                    <input id="name" type="text" value="${name}" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                  </div>
                  ${email ? `
                  <div>
                    <label class="block text-sm font-medium mb-1" for="email">${t("email", lang)}</label>
                    <input id="email" type="email" value="${email}" class="w-full rounded-lg px-3 py-2 border dark:border-gray-700 dark:bg-gray-900">
                  </div>
                ` : ''}`
        : `
                  <div>
                    <label class="block text-sm font-medium mb-1">${t("name", lang)}</label>
                    <p class="px-3 py-2">${name}</p>
                  </div>
                  ${email ? `
                  <div>
                    <label class="block text-sm font-medium mb-1">${t("email", lang)}</label>
                    <p class="px-3 py-2">${email}</p>
                  </div>`
          : ''}
                `
      }

            <div class="flex justify-end">
              ${isEditing
        ? `<button id="save-btn" class="bg-gradient-to-br
                 from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg transition">${t("save", lang)}</button>`
        : `<button id="edit-btn" class="bg-gradient-to-br
                 from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg transition">${t("edit", lang)}</button>`
      }
            </div>
          </div>
        </div>
      </section>
    `;

    // Attach listeners
    if (isEditing) {
      this.attachEvent(this, "#name", "input", (e: Event) =>
        this.handleChange("name", (e.target as HTMLInputElement).value)
      );
      this.attachEvent(this, "#email", "input", (e: Event) =>
        this.handleChange("email", (e.target as HTMLInputElement).value)
      );
      this.attachEvent(this, "#avatar", "change", this.handleAvatarChange);
      this.attachEvent(this, "#save-btn", "click", this.handleSave);
    } else {
      this.attachEvent(this, "#edit-btn", "click", this.toggleEdit);
    }
  }
}
