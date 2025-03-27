import GlobalState from './GlobalState.js';
import GlobalWs from './GlobalWs.js';

class EditProfileComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" }); // Isolation du style
        this.profileData = null; // Stocker les données du profil utilisateur
    }

    connectedCallback() {
        this.render();
        this.fetchProfileData();

        
    }

    async fetchProfileData() {
        try {
            const response = await fetch(`/api/users/me`);
            if (response.ok) {
                this.profileData = await response.json();
                this.render();
                console.log('Profile data:', this.profileData);
            } else {
                console.error('Failed to fetch profile data');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    async handleUploadImage(event) {
        event.preventDefault();
        const fileInput = this.shadowRoot.querySelector('#file');
        const file = fileInput.files[0];
        console.log('file', file);
         const formData = new FormData();
        formData.append('file', file); 


        try {
            const response = await fetch(`/api/users/upload-avatar`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                this.profileData = await response.json();
                this.render();
                console.log('Avatar updated:', this.profileData);
                GlobalState.setProfileData(this.profileData);
            } else {
                console.error('Failed to update avatar');
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    }

    async handleUpdateProfile(event) {
        event.preventDefault();
        const name = this.shadowRoot.querySelector('#name').value;
        const role = this.shadowRoot.querySelector('#role').value;
        const level = this.shadowRoot.querySelector('#level').value;
        const avatar = this.shadowRoot.querySelector('#avatar').value;

        try {
            const response = await fetch(`/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name:name/* , role, level, avatar */ })
            });
            console.log('response', response);

            if (response.ok) {
                this.profileData = await response.json();
                this.render();
                console.log('Profile updated:', this.profileData);
                GlobalState.setProfileData(this.profileData);
				//@TODO?
                // Envoyer un message de mise à jour via WebSocket?
               // GlobalWs.sendMessage('profile-updated', this.profileData);
            } else {
                console.log(name);
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    }

    render() {
        if (!this.profileData) {
            this.shadowRoot.innerHTML = `
                <div class="container">
                    <h2>Chargement du profil de l'utilisateur...</h2>
                </div>
            `;
        } else {
            this.shadowRoot.innerHTML = `
                <div class="container">
                    <h2>Éditer le profil de l'utilisateur</h2>
                    <form id="editProfileForm">
                        <div class="form-group">
                            <label for="name">Nom :</label>
                            <input type="text" id="name" name="name" value="${this.profileData.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="role">Rôle :</label>
                            <input type="text" id="role" name="role" value="${this.profileData.role}" required>
                        </div>
                        <div class="form-group">
                            <label for="level">Level :</label>
                            <input type="number" id="level" name="level" value="${this.profileData.level}" required>
                        </div>
                        <div class="form-group">
                            <label for="avatar">Avatar :</label>
                            <input type="text" id="avatar" name="avatar" value="${this.profileData.avatar}" required>
                        </div>
                        <button type="submit">Mettre à jour</button>
                    </form>


                    <h2>Avatar Upload</h2>
                    <form id="editAvatarProfileForm">
                        <div class="form-group">
                            <label for="file">Upload Avatar :</label>
                            <input type="file" id="file" name="file">
                        </div>
                        <button type="submit">Mettre à jour</button>
                    </form>
                </div>
            `;
            // Ajouter un écouteur d'événements pour le formulaire de mise à jour du profil
        this.shadowRoot.querySelector('#editProfileForm').addEventListener('submit', this.handleUpdateProfile.bind(this));
        this.shadowRoot.querySelector('#editAvatarProfileForm').addEventListener('submit', this.handleUploadImage.bind(this));
        }
    }
}

// Déclarer le composant dans le DOM
customElements.define("edit-profile-component", EditProfileComponent);