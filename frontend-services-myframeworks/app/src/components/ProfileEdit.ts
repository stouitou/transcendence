
import { BaseComponent } from "../frameworks/base-component";
import {  UserContext } from '../globalstate/GlobalState';
import { User } from '../types/types';
import { disable2FA, enable2FA, get2FADetail, TwoFA } from "../services/api.2fa";
import { addfriendByUserName, removeFriendById, updatePassword , updateProfileDeleteMe, updateProfileName, uploadProfileAvatar } from "../services/api.profile";
import { ProfileUpdateFormData } from "../types/forms.type";
import { profileUpdateAddFriendByNameconstraint, profileUpdateAvatarconstraint, profileUpdateDeleteconstraint, profileUpdateNameconstraint, profileUpdatePasswordconstraint, profileUpdateRemoveFriendById } from "../utils/constraints";

export class ProfileEdit extends BaseComponent<{user: User | null},ProfileUpdateFormData> {
  constructor() {
    super({ user: null});
  }
  handleListenerProfileUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    this.state.user = customEvent.detail.profileData;
    this.renderProfileEdit(this);
  };

  connectedCallback() {
    this.state.user = UserContext().user();
    this.render();
    this.listenCustomEvent("profile-data-updated", this.handleListenerProfileUpdate.bind(this));
  }

  handleSubmitUpdatePassword = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formUpdatePassword');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
       const formData = formHandler.getFormData();
      await  updatePassword(formData);
    } catch (error) {
       this.apiErrorHandler(error);
    }
  }

  setUser(user: User) {
    this.setState({ ...this.state, user });
    this.renderProfileEdit(this);
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
    <div class="flex  space-x-4">
      <div>
        <h2 class="text-3xl font-bold mb-6">Edit Profile</h2>
        <div id="message-box" class="font-bold text-center mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">Edit your profile information below.</p>
        <p class="text-gray-500 dark:text-gray-400">You can update your name, avatar, and password.</p>
        <img referrerPolicy="no-referrer" src=${avatar?.startsWith('http')?avatar:avatar?`${avatar}`:undefined} alt="avatar" width="100" height="100"/>
        <p class="text-gray-500 dark:text-gray-400">Name: ${user.name}</p>
        <p class="text-gray-500 dark:text-gray-400">Role: ${user.role}</p>            
      </div>
      	<form id="formAddfriend">
        <label for="friendName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add friend:</label>
        <input 
          id="friendName"
          type="text"
          name="friendName" 
          class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div id="friendName-error" class="font-bold text-center mb-4"></div>
        <button type="submit" class="btn">ADD Friend</button>
			</form>

      <form id="formRemoveFriend">
        <label for="friendId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remove Friend by ID:</label>
         <select friendId="inputSelectRmfriend" name='friendId'  class="select-form-message">
                        <option value="">Select a user</option>
                        ${user.friends?.map((friend) => (
                            `<option value='${friend.id}'>
                                ${friend.name} (${friend.id})
                            </option>`
                        ))}
                    </select>
        <div id="id-error" class="font-bold text-center mb-4"></div>
        <button type="submit" class="btn">Remove Friend</button>
      </form>
			<form id="formUpdateName">
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Name:</label>
        <input 
          id="name"
          type="text"
          name="name" value="${user.name}" 
          class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div id="name-error" class="font-bold text-center mb-4"></div>
        <button type="submit" class="btn">Update Name</button>
			</form>
			<form id="formUpdateAvatar">
      <img id="avatar-preview"
        src=''
        alt="Avatar Preview, select a file to see the preview"
        style="max-width: 120px;"
        referrerPolicy="no-referrer"
      />
				<label for="avatar" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New avatar:</label>
				<input					
					id="avatar"
					name="avatar"
					type="file"
					accept="image/png, image/jpeg"
					class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Avatar"
				 />
				<div id="avatar-error" class="font-bold text-center mb-4"></div>
				<button type="submit" class="btn">Update Avatar</button>
			</form>
        <form class="mt-4" id="formUpdatePassword">
            <h2 class="text-3xl font-bold mb-6">Update Password</h2>
            <label for="oldPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">oldPassword:</label>
            <div id="oldPassword-error" class="font-bold text-center mb-4"></div>
            <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                placeholder="Old Password"
                class="form-text-input"
            />
           <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">newPassword:</label>
             <div id="newPassword-error" class="font-bold text-center mb-4"></div>
            <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="New Password"
                class="form-text-input"
            />
           <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">confirmPassword:</label>
            <div id="confirmPassword-error" class="font-bold text-center mb-4"></div>
            <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm New Password"
                class="form-text-input"
            />
            <button
                type="submit"
                class="btn py-3"
            >
                Update Password
            </button>
        </form>

       <form id="formDeleteUser">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					Are you sure you want to delete this user?
				</label>
				<label class="switch"> 
					<input type="checkbox"  name="confirm" required/>
					<span class="slider round"></span>
				</label>
				<button type="submit" class="btn">Delete User</button>
			</form>
    </div>
    </div>
    `;
	  this.attachAllForm();
    this.previewImage();
  }

  previewImage = () => {
    const input = this.querySelector('#formUpdateAvatar input[type="file"]') as HTMLInputElement;
    if (!input) return;

    let preview = this.querySelector('#avatar-preview') as HTMLImageElement;
    if (!preview) {
      preview = document.createElement('img');
      preview.id = 'avatar-preview';
      preview.style.maxWidth = '120px';
      preview.style.display = 'block';
      preview.referrerPolicy = 'no-referrer';
      input.parentNode?.insertBefore(preview, input.nextSibling);
    }

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;

      // ⚠️ Sécurité de base
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté (jpeg, png uniquement).');
        input.value = '';
        return;
      }

      if (file.size < 1024) {
        alert('Fichier trop petit ou vide.');
        input.value = '';
        return;
      }

      // ✅ Teste la validité réelle via URL.createObjectURL
      const blobUrl = URL.createObjectURL(file);

      // Teste si l’image se charge bien
      const testImg = new Image();
      testImg.onload = () => {
        preview.src = blobUrl;
        preview.onload = () => URL.revokeObjectURL(blobUrl); // nettoyage
      };
      testImg.onerror = () => {
        alert('Impossible d\'afficher cette image. Fichier invalide ou corrompu.');
        input.value = '';
        preview.src = '';
        URL.revokeObjectURL(blobUrl);
      };
      testImg.src = blobUrl;
    });
  };

  handleSubmitUpdateName = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formUpdateName');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      const response = await  updateProfileName({name:formData.name});
      if (response) {
        this.setUser(response);
        this.showMessage(`Name updated! ${formData.name}`, 'success');
      }
    } catch (error) {
        //console.error('register failed:', error);
      this.apiErrorHandler(error);
    }
  }
    handleSubmitAddfriendByUserName = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formAddfriend');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      const response = await addfriendByUserName({friendName:formData.friendName});
      if (response) {
        this.showMessage(`Name updated! ${formData.friendName}`, 'success');
      }
    } catch (error) {
        //console.error('register failed:', error);
      this.apiErrorHandler(error);
    }
  }
  handleSubmitRemoveFriend = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formRemoveFriend');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      console.log("formData",formData);
      const response = await removeFriendById({friendId:formData.friendId});
      if (response) {
        this.showMessage(`friend removed! ${formData.friendId}`, 'success');
      }
    } catch (error) {
        //console.error('register failed:', error);
      this.apiErrorHandler(error);
    }
  }

  handleSubmitUpdateAvatar = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formUpdateAvatar');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      console.log('formHandler.getFormData()', formHandler?.getFormData());
      return;
    }
    try {
      const formData = formHandler.getFormData();
        const newformData = new FormData();
      newformData.append('file', formData.avatar); 
      const response = await  uploadProfileAvatar( newformData);
      if (response) {
      this.setUser(response);
      this.showMessage('avatar updated!', 'success');
      }
    } catch (error) {
        //console.error('register failed:', error);
      this.apiErrorHandler(error);
    }
  }

  handleSubmitDelete = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formDeleteUser');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {         
      await  updateProfileDeleteMe();
      UserContext().setUserLogout();  
      this.router.navigate('/');
    } catch (error) {
      this.apiErrorHandler(error);
    }
  }


  attachAllForm() {
    // attach the form handler to the form
    const formHandlerAddFriendByName = this.addForm('formAddfriend');
    const formHandlerRemoveFriend = this.addForm('formRemoveFriend');
    const formHandlerEditName = this.addForm('formUpdateName');
    const formHandlerEditAvatar = this.addForm('formUpdateAvatar');
    const formHandlerEditPassword = this.addForm('formUpdatePassword');
    const formHandlerDeleteUser = this.addForm('formDeleteUser');
    
    // add the validation constraints to the form handler
    formHandlerAddFriendByName?.addValidation(profileUpdateAddFriendByNameconstraint);
    formHandlerRemoveFriend?.addValidation(profileUpdateRemoveFriendById);
    formHandlerEditName?.addValidation(profileUpdateNameconstraint);
    formHandlerEditAvatar?.addValidation(profileUpdateAvatarconstraint);
    formHandlerEditPassword?.addValidation(profileUpdatePasswordconstraint);
    formHandlerDeleteUser?.addValidation(profileUpdateDeleteconstraint);

    // attach the event handler to the form
    this.attachEvent(this, '#formAddfriend', 'submit', this.handleSubmitAddfriendByUserName.bind(this));
    this.attachEvent(this, '#formRemoveFriend', 'submit', this.handleSubmitRemoveFriend.bind(this));
    this.attachEvent(this, '#formUpdateName', 'submit', this.handleSubmitUpdateName.bind(this));
    this.attachEvent(this, '#formUpdateAvatar', 'submit', this.handleSubmitUpdateAvatar.bind(this));
    this.attachEvent(this, '#formUpdatePassword', 'submit', this.handleSubmitUpdatePassword.bind(this));
    this.attachEvent(this, '#formDeleteUser', 'submit', this.handleSubmitDelete.bind(this));
  }

}


export class TwoFactorSetup extends BaseComponent<{ user: User | null; twoFa: TwoFA | null }> {
  constructor() {
    super({ user: null, twoFa: null });
  }

  connectedCallback() {
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
            `;
        }
    } catch (error) {
      console.error("Error generating 2FA QR code:", error);
    }
  }
}

//definir le composant
if (!customElements.get('two-factor-setup-component'))
  customElements.define('two-factor-setup-component', TwoFactorSetup);