import GlobalWs from './GlobalWs.js';

class MessageComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" }); // Isolation du style
    }

    connectedCallback() {
        this.render();

        // Écouter l'événement personnalisé 'profile-data-updated'
        document.addEventListener('private-message-received', (event) => {
            console.log('view component Profile data received:', event.detail.message);
            // Utiliser les données du profil utilisateur
            this.updateData(event.detail.message);
        });

        // Écouter l'événement personnalisé 'is-online'
        document.addEventListener('isOnline-message-received', (event) => {
            console.log('view component is online:', event.detail.users);
            // Utiliser les données de connexion
            this.isOnline(event.detail.users);
        });
        // Ajouter un écouteur d'événements pour le formulaire d'envoi de messages
        this.shadowRoot.querySelector('#sendMessageForm').addEventListener('submit', this.handleSendMessage.bind(this));
    }

    isOnline(users) {
        // Mettre à jour le contenu du composant avec les données de connexion
        const div = this.shadowRoot.querySelector('.online-info');
        div.innerHTML = `
            <p>Utilisateurs en ligne : ${users.join(', ')}</p>
        `;
    }

    updateData(data) {
        // Mettre à jour le contenu du composant avec les données du profil utilisateur
     const div = this.shadowRoot.querySelector('.message-info');
	

	 div.innerHTML = `
            <p>from: ${data.from??undefined}</p>
            <p>message: ${data.message??undefined}</p>
        `;
	    }
     handleSendMessage(event) {
        event.preventDefault();
        const to = this.shadowRoot.querySelector('#to').value;
        const message = this.shadowRoot.querySelector('#message').value;
        GlobalWs.sendMessage(to, message);
    }
    render() {
        this.shadowRoot.innerHTML = `
            <div class="container">
                <h2>is Online</h2>
                <div class="online-info">
                </div>
                <h2>message recu </h2>
                <div class="message-info">
                    <!-- Les informations du profil utilisateur seront mises à jour ici -->
                </div>
                <form id="sendMessageForm">
                    <h2>Envoyer un message</h2>
                    <div class="form-group">
                        <label for="to">À :</label>
                        <input type="text" id="to" name="to" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Message :</label>
                        <textarea id="message" name="message" required></textarea>
                    </div>
                    <button type="submit">Envoyer</button>
                </form>
            </div>
        `;
    }
}

// Déclarer le composant dans le DOM
customElements.define("message-component", MessageComponent);