import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from '../globalstate/GlobalState';
import { User } from '../types/types';
import { disable2FA, enable2FA, get2FADetail, TwoFA } from "../services/api.2fa";
import {
  addfriendByUserName,
  removeFriendById,
  updatePassword,
  updateProfileDeleteMe,
  updateProfileName,
  uploadProfileAvatar
} from "../services/api.profile";
import { ProfileUpdateFormData } from "../types/forms.type";
import {
  profileUpdateAddFriendByNameconstraint,
  profileUpdateAvatarconstraint,
  profileUpdateDeleteconstraint,
  profileUpdateNameconstraint,
  profileUpdatePasswordconstraint,
  profileUpdateRemoveFriendById
} from "../utils/constraints";

export class ProfileEdit extends BaseComponent<{ user: User | null }, ProfileUpdateFormData> {
  constructor() {
    super({ user: null });
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

  handleSubmitUpdatePassword = async (e: Event) => {
    e.preventDefault();
    const formHandler = this.getFormHandler('formUpdatePassword');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      await updatePassword(formData);
      this.showMessage('Password updated successfully.', 'success');
    } catch (error) {
      this.apiErrorHandler(error);
    }
  };

  setUser(user: User) {
    this.setState({ ...this.state, user });
    this.renderProfileEdit(this);
  }

  render(): void {
    this.renderProfileEdit(this);
  }

  renderProfileEdit(div: Element) {
    const { user } = this.state;
    if (!user) {
      this.innerHTML = `
        <div class="flex justify-center items-center h-40 bg-transparent">
          <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-300 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading… waiting for profile data</span>
          </div>
        </div>
      `;
      return;
    }

    const avatarUrl = user.avatar && (user.avatar.startsWith('http') ? user.avatar : user.avatar);
    div.innerHTML = `
      <two-factor-setup-component></two-factor-setup-component>

      <div class="max-w-3xl mx-auto py-8 px-6 space-y-10 bg-white bg-opacity-30 backdrop-blur-sm rounded-lg border border-gray-200">
        <div class="flex flex-col md:flex-row items-center gap-6 bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-lg border border-gray-200">
          <img
            referrerPolicy="no-referrer"
            src="${avatarUrl ?? '/default-avatar.svg'}"
            alt="Avatar"
            class="w-20 h-20 rounded-full border-2 border-gray-300 object-cover shadow-sm"
          />
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">${user.name}</h2>
            <p class="text-gray-600">Role: <span class="font-medium text-gray-700">${user.role}</span></p>
          </div>
        </div>

        <div class="space-y-8">
          <!-- Add Friend -->
          <form id="formAddfriend" class="space-y-3">
            <label for="friendName" class="block text-sm font-medium text-gray-700">Add Friend</label>
            <input
              id="friendName"
              type="text"
              name="friendName"
              class="w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-600"
              placeholder="Username"
              required
            />
            <div id="friendName-error" class="text-red-500 text-sm"></div>
            <button
              type="submit"
              class="mt-2 inline-block px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-medium rounded-lg shadow-md transition transform hover:scale-105"
            >
              Send Request
            </button>
          </form>

          <!-- Remove Friend -->
          <form id="formRemoveFriend" class="space-y-3">
            <label for="inputSelectRmfriend" class="block text-sm font-medium text-gray-700">Remove Friend</label>
            <select
              name="friendId"
              id="inputSelectRmfriend"
              class="w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
            >
              <option value="">— Select —</option>
              ${user.friends?.map(friend => `
                <option value="${friend.id}">
                  ${friend.name} (${friend.id})
                </option>
              `).join('')}
            </select>
            <div id="id-error" class="text-red-500 text-sm"></div>
            <button
              type="submit"
              class="mt-2 inline-block px-5 py-2 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-medium rounded-lg shadow-md transition transform hover:scale-105"
            >
              Remove
            </button>
          </form>

          <!-- Update Name -->
          <form id="formUpdateName" class="space-y-3">
            <label for="name" class="block text-sm font-medium text-gray-700">New Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value="${user.name}"
              class="w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-600"
              required
            />
            <div id="name-error" class="text-red-500 text-sm"></div>
            <button
              type="submit"
              class="mt-2 inline-block px-5 py-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-medium rounded-lg shadow-md transition transform hover:scale-105"
            >
              Update Name
            </button>
          </form>

          <!-- Update Avatar -->
          <form id="formUpdateAvatar" class="space-y-3">
            <label for="avatar" class="block text-sm font-medium text-gray-700">Change Avatar</label>
            <div class="flex items-center space-x-4">
              <img
                id="avatar-preview"
                src="${avatarUrl ?? '/default-avatar.svg'}"
                alt="Avatar Preview"
                class="w-16 h-16 rounded-full border border-gray-200 object-cover shadow-sm"
              />
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/png, image/jpeg"
                class="block text-sm text-gray-600"
              />
            </div>
            <div id="avatar-error" class="text-red-500 text-sm"></div>
            <button
              type="submit"
              class="mt-2 inline-block px-5 py-2 bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition transform hover:scale-105"
            >
              Upload
            </button>
          </form>

          <!-- Update Password -->
          <form id="formUpdatePassword" class="space-y-3">
            <h3 class="text-lg font-medium text-gray-700">Change Password</h3>
            <div class="space-y-2">
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                placeholder="Current Password"
                class="w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-600"
              />
              <div id="oldPassword-error" class="text-red-500 text-sm"></div>
            </div>
            <div class="space-y-2">
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="New Password"
                class="w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-600"
              />
              <div id="newPassword-error" class="text-red-500 text-sm"></div>
            </div>
            <div class="space-y-2">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm New Password"
                class="w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-600"
              />
              <div id="confirmPassword-error" class="text-red-500 text-sm"></div>
            </div>
            <button
              type="submit"
              class="mt-2 inline-block px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-medium rounded-lg shadow-md transition transform hover:scale-105"
            >
              Update Password
            </button>
          </form>

          <!-- Delete User -->
          <form id="formDeleteUser" class="space-y-3">
            <label class="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input type="checkbox" name="confirm" required class="h-4 w-4 text-red-600 focus:ring-red-300 border-gray-300 rounded"/>
              <span>Delete My Account</span>
            </label>
            <button
              type="submit"
              class="mt-2 inline-block px-5 py-2 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-medium rounded-lg shadow-md transition transform hover:scale-105"
            >
              Delete Account
            </button>
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

    const preview = this.querySelector('#avatar-preview') as HTMLImageElement;
    if (!preview) return;

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Supported formats: JPEG, PNG.');
        input.value = '';
        return;
      }

      if (file.size < 1024) {
        alert('File is too small or empty.');
        input.value = '';
        return;
      }

      const blobUrl = URL.createObjectURL(file);
      const testImg = new Image();
      testImg.onload = () => {
        preview.src = blobUrl;
        preview.onload = () => URL.revokeObjectURL(blobUrl);
      };
      testImg.onerror = () => {
        alert('Cannot display this image. File is invalid or corrupted.');
        input.value = '';
        preview.src = '';
        URL.revokeObjectURL(blobUrl);
      };
      testImg.src = blobUrl;
    });
  };

  handleSubmitUpdateName = async (e: Event) => {
    e.preventDefault();
    const formHandler = this.getFormHandler('formUpdateName');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      const response = await updateProfileName({ name: formData.name });
      if (response) {
        this.setUser(response);
        this.showMessage(`Name updated to ${formData.name}`, 'success');
      }
    } catch (error) {
      this.apiErrorHandler(error);
    }
  };

  handleSubmitAddfriendByUserName = async (e: Event) => {
    e.preventDefault();
    const formHandler = this.getFormHandler('formAddfriend');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      const response = await addfriendByUserName({ friendName: formData.friendName });
      if (response) {
        this.showMessage(`Friend request sent to ${formData.friendName}`, 'success');
      }
    } catch (error) {
      this.apiErrorHandler(error);
    }
  };

  handleSubmitRemoveFriend = async (e: Event) => {
    e.preventDefault();
    const formHandler = this.getFormHandler('formRemoveFriend');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      await removeFriendById({ friendId: formData.friendId });
      this.showMessage(`Friend with ID ${formData.friendId} removed`, 'success');
    } catch (error) {
      this.apiErrorHandler(error);
    }
  };

  handleSubmitUpdateAvatar = async (e: Event) => {
    e.preventDefault();
    const formHandler = this.getFormHandler('formUpdateAvatar');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      const newformData = new FormData();
      newformData.append('file', formData.avatar);
      const response = await uploadProfileAvatar(newformData);
      if (response) {
        this.setUser(response);
        this.showMessage('Avatar updated successfully', 'success');
      }
    } catch (error) {
      this.apiErrorHandler(error);
    }
  };

  handleSubmitDelete = async (e: Event) => {
    e.preventDefault();
    const formHandler = this.getFormHandler('formDeleteUser');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      await updateProfileDeleteMe();
      UserContext().setUserLogout();
      this.router.navigate('/');
    } catch (error) {
      this.apiErrorHandler(error);
    }
  };

  attachAllForm() {
    const formHandlerAddFriendByName = this.addForm('formAddfriend');
    const formHandlerRemoveFriend = this.addForm('formRemoveFriend');
    const formHandlerEditName = this.addForm('formUpdateName');
    const formHandlerEditAvatar = this.addForm('formUpdateAvatar');
    const formHandlerEditPassword = this.addForm('formUpdatePassword');
    const formHandlerDeleteUser = this.addForm('formDeleteUser');

    formHandlerAddFriendByName?.addValidation(profileUpdateAddFriendByNameconstraint);
    formHandlerRemoveFriend?.addValidation(profileUpdateRemoveFriendById);
    formHandlerEditName?.addValidation(profileUpdateNameconstraint);
    formHandlerEditAvatar?.addValidation(profileUpdateAvatarconstraint);
    formHandlerEditPassword?.addValidation(profileUpdatePasswordconstraint);
    formHandlerDeleteUser?.addValidation(profileUpdateDeleteconstraint);

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
      console.log("TwoFactorSetup connectedCallback fetch2FADetails");
    });
  }

  async fetch2FADetails() {
    const { user } = this.state;
    if (!user) return;

    try {
      console.log("Fetching 2FA details for user:", user.id);
      const data = await get2FADetail();
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
      await this.fetch2FADetails();
    } catch (error) {
      console.error("Error HandleEnable2FA 2FA:", error);
    }
  }

  async HandleDisable2FA() {
    const { user } = this.state;
    if (!user) return;

    try {
      await disable2FA();
      await this.fetch2FADetails();
    } catch (error) {
      console.error("Error HandleDisable2FA:", error);
    }
  }

  setEnable2FA() {
    const { twoFa } = this.state;
    if (!twoFa) return;
    const enable = !twoFa.two_factor_auth;
    this.setState({ ...this.state, twoFa: { ...twoFa, two_factor_auth: enable } });
    enable ? this.HandleEnable2FA() : this.HandleDisable2FA();
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
        <div class="flex justify-center items-center h-32 bg-transparent">
          <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-300 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading… waiting for 2FA data</span>
          </div>
        </div>
      `;
      return;
    }

    this.innerHTML = `
      <div class="max-w-xl mx-auto py-6 px-5 bg-white bg-opacity-30 backdrop-blur-sm rounded-lg border border-gray-200 space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold ${twoFa?.two_factor_auth ? 'text-green-600' : 'text-red-600'}">
            Two-Factor Authentication
          </h2>
          <button
            id="toggle2FA"
            class="${twoFa?.two_factor_auth ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition transform hover:scale-105"
          >
            ${twoFa?.two_factor_auth ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>

        ${twoFa?.two_factor_auth && twoFa.two_factor_auth_method === "totp" ? `
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-700">Current Method: TOTP</h3>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600">Switch to:</span>
              <button
                id="changetototp"
                class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition transform hover:scale-105"
              >
                Email
              </button>
            </div>
            <button
              id="createnewqrcode"
              class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition transform hover:scale-105"
            >
              Generate New QR Code
            </button>
            <div class="mt-4 text-center">
              <h4 class="text-md font-medium text-gray-800 mb-2">Scan the QR Code</h4>
              <img
                src="/api/users/me/2fa/qrcode"
                alt="QR Code for 2FA"
                class="w-36 h-36 mx-auto rounded-lg border border-gray-200 shadow-md"
              />
              <p class="text-sm text-gray-600 mt-2">Use an authenticator app (e.g. Google Authenticator) to scan.</p>
            </div>
          </div>
        ` : ''}

        ${twoFa?.two_factor_auth && twoFa.two_factor_auth_method === "email" ? `
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-700">Current Method: Email</h3>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600">Switch to:</span>
              <button
                id="changetototp"
                class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition transform hover:scale-105"
              >
                TOTP
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.attachEvent(this, "#toggle2FA", "click", this.setEnable2FA.bind(this));
    this.attachEvent(this, "#changetototp", "click", this.setMethod2FA.bind(this));
    this.attachEvent(this, "#createnewqrcode", "click", this.handleCreateNewQrCode.bind(this));
  }

  async handleCreateNewQrCode() {
    const { user } = this.state;
    if (!user) return;

    try {
      const timestamp = new Date().getTime(); // avoid caching
      console.log("2FA QR code generated successfully");
      const div = this.querySelector(".qrcode");
      if (div) {
        div.innerHTML = `
          <h3 class="text-md font-medium text-gray-700 mb-2">Scan the QR Code</h3>
          <img
            src="/api/users/me/2fa/qrcode?timestamp=${timestamp}"
            alt="QR Code for 2FA"
            class="w-36 h-36 mx-auto rounded-lg border border-gray-200 shadow-md"
          />
          <p class="text-sm text-gray-600">Use an authenticator app like Google Authenticator to scan the code.</p>
        `;
      }
    } catch (error) {
      console.error("Error generating 2FA QR code:", error);
    }
  }
}

if (!customElements.get('two-factor-setup-component')) {
  customElements.define('two-factor-setup-component', TwoFactorSetup);
}
