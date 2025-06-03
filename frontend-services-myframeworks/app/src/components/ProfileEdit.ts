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
        <div class="bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 backdrop-blur-sm rounded-lg p-6 flex justify-center items-center">
          <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-300 dark:text-gray-500 animate-spin fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading... waiting Profile Data</span>
          </div>
        </div>
      `;
      return;
    }

    const avatar = user.avatar ?? '';
    div.innerHTML = `
      <two-factor-setup-component></two-factor-setup-component>
      <div class="bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 backdrop-blur-sm rounded-lg p-6 space-y-8">
        <div class="flex flex-col md:flex-row md:space-x-8">
          <div class="flex-shrink-0">
            <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Edit Profile</h2>
            <div id="message-box" class="text-center text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-4"></div>
            <p class="text-gray-700 dark:text-gray-300 mb-1">Manage your profile details below:</p>
            <div class="mt-4 mb-6 flex items-center space-x-4">
              <div class="w-24 h-24 rounded-full overflow-hidden bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 flex items-center justify-center backdrop-blur-sm">
                <img referrerPolicy="no-referrer" src="${avatar.startsWith('http') ? avatar : avatar ? `${avatar}` : ''}" alt="avatar" class="w-full h-full object-cover"/>
              </div>
              <div>
                <p class="text-gray-800 dark:text-gray-100 font-medium">${user.name}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">${user.role}</p>
              </div>
            </div>
          </div>

          <div class="flex-1 space-y-6">
            <form id="formAddfriend" class="space-y-2 backdrop-blur-sm">
              <label for="friendName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Add Friend by Username</label>
              <div class="relative">
                <input 
                  id="friendName"
                  type="text"
                  name="friendName"
                  class="w-full pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                  required
                />
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm1 14H9v-1h2v1zm0-3H9V4h2v7z"/>
                  </svg>
                </span>
              </div>
              <div id="friendName-error" class="text-red-500 text-sm"></div>
              <button type="submit" class="mt-2 bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Add Friend</button>
            </form>

            <form id="formRemoveFriend" class="space-y-2 backdrop-blur-sm">
              <label for="friendId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Remove Friend</label>
              <div class="relative">
                <select id="friendId" name="friendId" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Select a friend</option>
                  ${user.friends?.map((friend) => (
        `<option value="${friend.id}">${friend.name} (${friend.id})</option>`
    )).join("")}
                </select>
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
              <div id="id-error" class="text-red-500 text-sm"></div>
              <button type="submit" class="mt-2 bg-red-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Remove Friend</button>
            </form>

            <form id="formUpdateName" class="space-y-2 backdrop-blur-sm">
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">New Name</label>
              <div class="relative">
                <input 
                  id="name"
                  type="text"
                  name="name"
                  value="${user.name}"
                  class="w-full pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new name"
                  required
                />
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 0010 4zm0 10a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                  </svg>
                </span>
              </div>
              <div id="name-error" class="text-red-500 text-sm"></div>
              <button type="submit" class="mt-2 bg-green-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Update Name</button>
            </form>

            <form id="formUpdateAvatar" class="space-y-2 backdrop-blur-sm">
              <label for="avatar" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Change Avatar</label>
              <div class="flex items-center space-x-4">
                <div class="w-24 h-24 rounded-full overflow-hidden bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 flex items-center justify-center backdrop-blur-sm">
                  <img id="avatar-preview" src="" alt="Avatar Preview" class="w-full h-full object-cover"/>
                </div>
                <label for="avatar" class="relative cursor-pointer">
                  <span class="inline-flex items-center px-4 py-2 bg-indigo-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium rounded-md shadow backdrop-blur-sm transition">
                    <svg class="w-5 h-5 mr-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 8h2v3a1 1 0 102 0v-3h2a1 1 0 100-2H9V6a1 1 0 10-2 0v3H5a1 1 0 100 2h2v3a1 1 0 102 0v-3z"/>
                    </svg>
                    Choose File
                  </span>
                  <input id="avatar" name="avatar" type="file" accept="image/png, image/jpeg" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </label>
              </div>
              <div id="avatar-error" class="text-red-500 text-sm"></div>
              <button type="submit" class="mt-2 bg-indigo-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Upload Avatar</button>
            </form>

            <form id="formUpdatePassword" class="space-y-4 backdrop-blur-sm">
              <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Update Password</h3>
              <div class="space-y-2">
                <label for="oldPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Old Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  placeholder="Enter old password"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div id="oldPassword-error" class="text-red-500 text-sm"></div>
              </div>
              <div class="space-y-2">
                <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter new password"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div id="newPassword-error" class="text-red-500 text-sm"></div>
              </div>
              <div class="space-y-2">
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white bg-opacity-30 dark:bg-gray-700 dark:bg-opacity-30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div id="confirmPassword-error" class="text-red-500 text-sm"></div>
              </div>
              <button type="submit" class="mt-2 bg-yellow-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Change Password</button>
            </form>

            <form id="formDeleteUser" class="space-y-3 backdrop-blur-sm">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Delete Account</label>
              <div class="flex items-center space-x-3">
                <label class="switch">
                  <input type="checkbox" name="confirm" required />
                  <span class="slider round"></span>
                </label>
                <span class="text-gray-600 dark:text-gray-400 text-sm">I understand this action is irreversible.</span>
              </div>
              <div id="delete-error" class="text-red-500 text-sm"></div>
              <button type="submit" class="mt-2 bg-red-700 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Delete Account</button>
            </form>
          </div>
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
      preview.className = 'w-full h-full object-cover rounded-full';
      preview.style.maxWidth = '96px';
      preview.referrerPolicy = 'no-referrer';
      input.parentNode?.insertBefore(preview, input.nextSibling);
    }

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
    // try {
      // await updateProfileDeleteMe();
      // this.router.navigate('/logout');
   try {         
    await  updateProfileDeleteMe();
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
        <div class="bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 backdrop-blur-sm rounded-lg p-6 flex justify-center items-center">
          <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-300 dark:text-gray-500 animate-spin fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading... waiting 2FA Data</span>
          </div>
        </div>
      `;
      return;
    }

    this.innerHTML = `
      <div class="bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 backdrop-blur-sm rounded-lg p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold ${twoFa?.two_factor_auth ? 'text-green-600' : 'text-red-600'}">Two-Factor Authentication</h2>
          <button id="toggle2FA" class="${twoFa?.two_factor_auth ? 'bg-red-600 bg-opacity-80 hover:bg-opacity-100' : 'bg-green-600 bg-opacity-80 hover:bg-opacity-100'} text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">
            ${twoFa?.two_factor_auth ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>

        ${twoFa?.two_factor_auth && twoFa.two_factor_auth_method === "totp" ? `
          <div class="space-y-4 backdrop-blur-sm">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Current Method: TOTP</h3>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600 dark:text-gray-400">Switch to:</span>
              <button id="changetototp" class="bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Email</button>
            </div>
            <button id="createnewqrcode" class="bg-indigo-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">Generate New QR Code</button>
            <div class="mt-4">
              <h4 class="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Scan the QR Code:</h4>
              <div class="mt-2 flex justify-center">
                <img src="/api/users/me/2fa/qrcode" alt="QR Code for 2FA" class="w-40 h-40 rounded-lg shadow-md"/>
              </div>
              <p class="text-center text-gray-600 dark:text-gray-400 mt-2">Use an authenticator app (e.g., Google Authenticator) to scan.</p>
            </div>
          </div>
        ` : ''}

        ${twoFa?.two_factor_auth && twoFa.two_factor_auth_method === "email" ? `
          <div class="space-y-4 backdrop-blur-sm">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Current Method: Email</h3>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600 dark:text-gray-400">Switch to:</span>
              <button id="changetototp" class="bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white font-medium py-2 px-4 rounded-md backdrop-blur-sm">TOTP</button>
            </div>
          </div>
        ` : ''}

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
      const timestamp = new Date().getTime(); // avoid caching
      console.log("2FA QR code generated successfully");
      const div = this.querySelector(".qrcode");
      if (div) {
        div.innerHTML = `
          <h3 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Scan the QR Code</h3>
          <img src="/api/users/me/2fa/qrcode?timestamp=${timestamp}" alt="QR Code for 2FA" class="w-40 h-40 mx-auto mb-2 rounded-lg shadow-md"/>
          <p class="text-center text-gray-600 dark:text-gray-400">Use an authenticator app like Google Authenticator to scan the code.</p>
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
