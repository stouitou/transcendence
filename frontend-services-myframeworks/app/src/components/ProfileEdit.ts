
import { BaseComponent } from "../frameworks/base-component";
import { User, UserContext } from '../globalstate/GlobalState';

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
      this.setState({ ...this.state, user: { ...this.state.user, name: input.value } });
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
        const response = await fetch(`/api/users/upload-avatar`, {
            method: 'POST',
            body: formData
        });
  
        if (response.ok) {
            const profileData = await response.json();
            console.log('Avatar updated:', profileData);
            this.setUser(profileData);
        } else {
            console.error('Failed to update avatar');
        }
    } catch (error) {
        console.error('Error updating avatar:', error);
    }
  }
  
  handleUpdateProfile = async(e:Event)=> {

    e.preventDefault();
    try {
        const response = await fetch(`/api/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name:this.state.user?.name/* , role, level, avatar */ })
        });
        console.log('response', response);
  
        if (response.ok) {
            const profileData = await response.json();
            console.log('Profile updated:', profileData);
             this.setUser(profileData);
            //@TODO?
            // Envoyer un message de mise à jour via WebSocket?
        } else {
            console.log(name);
            console.error('Failed to update profile');
        }
    } catch (error) {
    console.error('Error updating profile:', error);
  }
  }
  
}