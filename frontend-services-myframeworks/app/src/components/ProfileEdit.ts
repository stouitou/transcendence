
import { BaseComponent } from "../frameworks/base-component.ts";
import { User, UserContext } from '../globalstate/GlobalState.ts';

type ProfileState = {
  user: User | null;
  isEditing: boolean;
  files: FileList | null;
};


export class ProfileEdit extends BaseComponent<ProfileState> {
  constructor() {
    super({ user: null,isEditing:false,files:null });
  }
    connectedCallback() {
      console.log('ProfileEdit connectedCallback');
      this.state.user = UserContext().user();
      this.render();
     /*  document.addEventListener('profile-data-updated', (e: Event) => {
        const customEvent = e as CustomEvent;
        console.log('profile-data-updated event received');
        this.state.user = customEvent.detail.profileData;
        this.render();
      }); */
    }
    setUser(user: User) {
      this.setState({ ...this.state, user });
    }
  
    setIsEdit() {
      this.setState({ user: { ...this.state.user }, isEditing: !this.state.isEditing });
      this.render();
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
      div.innerHTML = ` <div>Loading... renderProfileEdit</div>`;
      return;
    }    
    const avatar = user?.avatar??'';
    div.innerHTML = `
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
                <img src=${avatar?.startsWith('http')?avatar:avatar?`https://localhost:4433/${avatar}`:undefined} alt="avatar" width="100" height="100"/>
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
            this.setIsEdit(); 
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
             this.setIsEdit();
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