
import { BaseComponent } from "../frameworks/base-component";
import {  UserContext } from '../globalstate/GlobalState';
import { User } from '../types/types';
import { disable2FA, enable2FA, get2FADetail, TwoFA } from "../services/api.2fa";
import { updateProfile, uploadAvatar } from "../services/api.profile";

type ProfileState = {
  user: User | null;
  files: FileList | null;
};


export class ProfileEdit extends BaseComponent<ProfileState> {
  constructor() {
    super({ user: null,files:null });
  }
  handleListenerProfileUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    this.state.user = customEvent.detail.profileData;
    this.renderProfileEdit(this);
  };

    connectedCallback() {
      console.log('ProfileEdit connectedCallback');
      this.state.user = UserContext().user();
      this.render();
      this.listenCustomEvent("profile-data-updated", this.handleListenerProfileUpdate.bind(this));
    }
    setUser(user: User) {
      this.setState({ ...this.state, user });
      this.renderProfileEdit(this);
    }
    
    setName(event: Event) {
      const input = event.target as HTMLInputElement;
      //en l'etat danger sur l'input.value: il faut sanitizer,
      // on autorize uniquement les lettres, chiffres et espaces
      // et @_-
      const sanitizedValue = input.value.replace(/[^a-zA-Z0-9@_.-]/g, '');
      this.setState({ ...this.state, user: { ...this.state.user, name: sanitizedValue } });
    }
    setAvatar(event: Event) {
      const input = event.target as HTMLInputElement;
      this.setState({ ...this.state, user: { ...this.state.user, avatar: input.value } });
    }
    setFiles(event: Event) {
      const input = event.target as HTMLInputElement;
      console.log('files', input.files);
      this.setState({ ...this.state,  files: input.files  });
    }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log('attributeChangedCallback', name, oldValue, newValue);
  }
  render(): void {
    const div = this;
    this.renderProfileEdit(div);
  }

  renderProfileEdit(div: Element) {
    const { user } = this.state;
    if (!user) {
      this.innerHTML = ` 
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
          <div class="flex items-center space-x-4">
              <div role="status">
                  <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  <span class="sr-only">Loading... waiting ProfileData</span>
              </div>
          </div>
        </div>
        `;
      return;
    }
    const avatar = user?.avatar??'';
    div.innerHTML = `
    <two-factor-setup-component></two-factor-setup-component>
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
    <div class="flex items-center space-x-4">
         <form class="mt-4" id="editProfileForm">
            <label for="name" class="mb-2">Name:</label>
            <input
                type="text"
                id="name"
                value=${user.name}
                placeholder="Enter your name"
                class="form-text-input"
            />
            <div class="flex justify-between items-center mb-4">
                <label class="block mb-2">Role:</label>
                <span>${user.role}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
                <img referrerPolicy="no-referrer" src=${avatar?.startsWith('http')?avatar:avatar?`https://localhost:4433/${avatar}`:undefined} alt="avatar" width="100" height="100"/>
                <div id="editAvatarProfileForm" >
                        <div class="form-group">
                            <label for="file">Upload Avatar :</label>
                            <input
                                type="file"
                                id="file"
                                name="file"
                                class="form-text-input"/>
                        </div>
                        <button
                            id="uploadAvatarBtn"
                            type="submit"
                            class="btn py-3"
                          
                         >Update Avatar</button>
                    </div>
            </div>
            
            <label class="mb-2">Avatar URL:</label>
            <input
                type="text"
                id="avatar"
                value=${avatar}
                placeholder="Enter your avatar URL"
                class="form-text-input"
            />
            <button
                type="submit"
                class="btn"
            >
                Save
            </button>
        </form>
    </div>
    </div>
    `;
    this.attachEvent(this, '#name', 'change', this.setName.bind(this));
    this.attachEvent(this, '#avatar', 'change', this.setAvatar.bind(this));
    this.attachEvent(this, '#file', 'change', this.setFiles.bind(this));
    this.attachEvent(this, '#editProfileForm', 'submit', this.handleUpdateProfile.bind(this));
    this.attachEvent(this, '#uploadAvatarBtn', 'click', this.handleUploadImage.bind(this));
  }




  handleUploadImage = async(event:Event)=> {
    event.preventDefault();
     const formData = new FormData();
     const file = this.state.files![0];
     console.log('file', file);
     if (!file) {
        return;
    }
    formData.append('file', file);         
    try {
      const response = await uploadAvatar(formData);
      if (response) {
        console.log('Avatar updated:', response);
        this.setUser(response);
      } else {
        console.error('Failed to update avatar');
      }

      /*   const response = await fetch(`/api/users/upload-avatar`, {
            method: 'POST',
            body: formData
        });
  
        if (response.ok) {
            const profileData = await response.json();
            console.log('Avatar updated:', profileData);
            this.setUser(profileData);
        } else {
            console.error('Failed to update avatar');
        } */
    } catch (error) {
        console.error('Error updating avatar:', error);
    }
  }
  
  handleUpdateProfile = async(e:Event)=> {
    e.preventDefault();
    try {
      //  const res = await fetch('/api/auth/csrf');
      //  const { csrfToken } = await res.json();
        const response = await updateProfile({ name: this.state.user?.name });
        /* const response = await fetch(`/api/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ name:this.state.user?.name
            //, role, level, avatar
             })
        }); */
       // console.log('response', response);
  
        if (response) {
            console.log('Profile updated:', response);
             this.setUser(response);
            //@TODO?
            // Envoyer un message de mise à jour via WebSocket? par exemple si displayName
        } else {
          //  console.log(name);
            console.error('Failed to update profile', response);
        }
    } catch (error) {
    console.error('Error updating profile:', error);
  }
  }
  
}
/* export type TwoFA = {
	id: 4,
	otp?: string,
	otpExpiration?: string,
	provider: "local",
	provider_id: string,
	two_factor_auth: boolean,
	two_factor_auth_method: "email"|"totp",
} */
export class TwoFactorSetup extends BaseComponent<{ user: User | null; twoFa: TwoFA | null }> {
  constructor() {
    super({ user: null, twoFa: null });
  }

  connectedCallback() {
    console.log("TwoFactorSetup connectedCallback");
    this.state.user = UserContext().user();
    this.fetch2FADetails().then(() => {
      //this.render();
      console.log("TwoFactorSetup connectedCallback fetch2FADetails");
    });
  }

  async fetch2FADetails() {
    const { user } = this.state;
    if (!user) return;

    try {
      console.log("Fetching 2FA details for user:", user.id);
      const data = await get2FADetail(/* user.id */);
      this.setState({ ...this.state, twoFa: data ?? null });
      console.log("2FA data:", data);
      this.render();
    } catch (error) {
      console.error("Error fetching 2FA details:", error);
    }
  }
  async HandleEnable2FA() {
    const { user, twoFa } = this.state;
    if (!user) return;

    try {
        await enable2FA(twoFa?.two_factor_auth!, twoFa?.two_factor_auth_method!);
        await this.fetch2FADetails(); // Refresh the 2FA state
    } catch (error) {
      console.error("Error HandleEnable2FA 2FA:", error);
    }
  }
async HandleDisable2FA() {
    const { user } = this.state;
    if (!user) return;

    try {
       await disable2FA();
       await this.fetch2FADetails(); // Refresh the 2FA state
    } catch (error) {
      console.error("Error HandleDisable2FA:", error);
    }
  }

/*   async HandleToggle2FA() {
    const { user, twoFa } = this.state;
    if (!user) return;

    try {
      const response = await fetch(`/api/users/me/2fa/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: twoFa?.two_factor_auth, method: twoFa?.two_factor_auth_method }),
      });

      if (response.ok) {
        console.log("2FA toggled successfully");
        this.fetch2FADetails(); // Refresh the 2FA state
      } else {
        console.error("Failed to toggle 2FA");
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
    }
  } */
  setEnable2FA() {
    const { twoFa } = this.state;
    if (!twoFa) return;
    const enable = !twoFa.two_factor_auth;
    this.setState({ ...this.state, twoFa: { ...twoFa, two_factor_auth: enable } });
    enable?this.HandleEnable2FA():this.HandleDisable2FA();
  }
  setMethod2FA() {
    const { twoFa } = this.state;
    if (!twoFa) return;
    const method = twoFa.two_factor_auth_method === "email" ? "totp" : "email";
    this.setState({ ...this.state, twoFa: { ...twoFa, two_factor_auth_method: method } });
    console.log("this.state.twofa", this.state.twoFa);
    this.HandleEnable2FA();
  }

  render(): void {
    const { user, twoFa } = this.state;
    if (twoFa?.provider !== "local") {
      this.innerHTML = ``;
      return;
    }

    if (!user) {
      this.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
          <div class="flex items-center space-x-4">
            <div role="status">
              <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span class="sr-only">Loading... waiting ProfileData</span>
            </div>
          </div>
        </div>
      `;
      return;
    }
    this.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
        <div class="flex items-center space-x-4">
          <h2 class="text-3xl font-bold   ${twoFa?.two_factor_auth ? `text-green-500` : `text-red-500`}">Two-Factor Authentication</h2>
          <button id="toggle2FA" class="btn ${twoFa?.two_factor_auth ? "bg-red-500" : "bg-green-500"} hover:bg-opacity-80 text-white py-2 px-4 rounded">
            ${twoFa?.two_factor_auth ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
        ${twoFa?.two_factor_auth && twoFa.two_factor_auth_method === "totp" ? `
          <div class="mt-4">
          <h3 class="text-lg font-semibold">current 2fa : totp</h3>
              <div class="max-w-sm flex flex-row justify-between">
                <h4 class="text-lg font-semibold">change to: </h3>
                <button id="changetototp" class="btn hover:bg-opacity-80 text-white py-2 px-4 rounded">
                email
                </button>
              </div>
             <button class="btn" id="createnewqrcode">generate new QrCode</button>
              <div class="qrcode"></div>
           </div>
        ` : ""}
        ${twoFa?.two_factor_auth && twoFa.two_factor_auth_method === "email" ? `
          <div class="mt-4">
            <h3 class="text-lg font-semibold">current 2fa : email</h3>
              <div class="max-w-sm flex flex-row justify-between">
                <h4 class="text-lg font-semibold">change to: </h3>
                <button id="changetototp" class="btn hover:bg-opacity-80 text-white py-2 px-4 rounded">
                totp
                </button>
              </div>
          </div>
        ` : ""}
      </div>
      <br>
    `;

    this.attachEvent(this, "#toggle2FA", "click", this.setEnable2FA.bind(this));
    this.attachEvent(this, "#changetototp", "click", this.setMethod2FA.bind(this));
    this.attachEvent(this, "#createnewqrcode", "click", this.handleCreateNewQrCode.bind(this));
  }

  async handleCreateNewQrCode() {
    const { user } = this.state;
    if (!user) return;

    try {
        const timestamp = new Date().getTime();//eviter la mise en cache
        console.log("2FA QR code generated successfully");
        const div = this.querySelector(".qrcode");
        if (div) {
          div.innerHTML = ` <h3 class="text-lg font-semibold">Scan the QR Code</h3>
              <img src="/api/users/me/2fa/qrcode?timestamp=${timestamp}" alt="QR Code for 2FA" class="qr-code-image" />
               <p class="text-center mt-4">Use an authenticator app like Google Authenticator to scan the QR code.</p>
            `; // Clear previous QR code
        }
    } catch (error) {
      console.error("Error generating 2FA QR code:", error);
    }
  }
}

//definir le composant
if (!customElements.get('two-factor-setup-component'))
  customElements.define('two-factor-setup-component', TwoFactorSetup);