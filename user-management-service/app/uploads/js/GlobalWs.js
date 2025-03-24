
const initializeWebSocket = () => {
    /* const socket = new WebSocket("wss://localhost:4433/ws", "echo-protocol");
    socket.onopen = () => {
        console.log("Connecté via WSS !");
    };
    return socket; */
};

const GlobalWs = (() => {
    let userId = null;
   // const socket =  initializeWebSocket();
   const socket = new WebSocket("wss://localhost:4433/ws", "echo-protocol");
    socket.onopen = () => {
        console.log("Connecté via WSS !");
    };


    socket.onmessage = (event) => {
        console.log("Message reçu :", event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.type === "welcome") {
            userId = data.userId;
        }
        else  if (data.type === "isOnline") {
            document.dispatchEvent(new CustomEvent('isOnline-message-received', {
                bubbles: true,
                composed: true,
                detail: { users: data.users } 
              }));
        }
        else if (data.type === "private") {
              document.dispatchEvent(new CustomEvent('private-message-received', {
                  bubbles: true,
                  composed: true,
                  detail: { message: data } 
                }));
          }
          else if (data.type === "public") {
              document.dispatchEvent(new CustomEvent('public-message-received', {
                  detail: { message: data.message } 
                }));
          }
          else
          {
             document.dispatchEvent(new CustomEvent('message-received', {
               detail: { message: data }
             }));
          }
        } catch (error) {
            console.error("Erreur lors de la lecture du message :", error);
            console.log("[debug error] Message reçu :", event.data);
        }

    };
    
    socket.onerror = (error) => {
        console.error("Erreur WebSocket :", error);
    };
    
    socket.onclose = () => {
        console.log("Connexion fermée");
    };

    const sendMessage =  (to, message) => {
        if (socket.readyState !== WebSocket.OPEN) {
            console.warn("⚠️ WebSocket pas encore prêt. Ajout du message en attente...");
            setTimeout(() => sendMessage(to, message), 100); // Réessaye après 100ms
            return;
        }
        const data = JSON.stringify({ type: "private", to, message });
        socket.send(data);
    };


    const sendLogoutMessage = () => {
        if (socket.readyState !== WebSocket.OPEN) {
            console.warn("⚠️ WebSocket pas encore prêt. Ajout du message en attente...");
            setTimeout(sendLogoutMessage, 100); // Réessaye après 100ms
            return;
        }
        const data = JSON.stringify({ type: "logout", userId });
        socket.send(data);
    };
    
    const sendLoginMessage =  (id) => {
        if (socket.readyState === WebSocket.OPEN) {
            const data = JSON.stringify({ type: "login", userId , id});
            socket.send(data);
        }
        else {
            console.warn("⚠️ WebSocket pas encore prêt. Ajout du message en attente...");
            setTimeout(() => sendLoginMessage(id), 100); // Réessaye après 100ms
        }
    };


    return {
        sendMessage,
        initializeWebSocket,
        sendLogoutMessage,
        sendLoginMessage
    };
/* 


    let authData = null;
    let profileData = null;
    let islogged = false

    const getIslogged = () => islogged;
    const setLoginSucces = () => {
        islogged = true;
        document.dispatchEvent(new CustomEvent('login-success', {
            bubbles: true, // Permettre la propagation de l'événement
            composed: true, // Permettre la traversée des shadow DOM
            detail: { islogged: true }
        }));
    }
    const setLogoutSuccess = () => {
        islogged = false;
        authData = null;
        profileData = null;
        document.dispatchEvent(new CustomEvent('logout-success', {
            
            detail: { islogout: false }
        }));
    };

    const getAuthData = () => authData;

    const setAuthData = (data) => {
        authData = data;
        document.dispatchEvent(new CustomEvent('auth-data-updated', {
            detail: { authData: data }
        }));
    };

    const getProfileData = () => profileData;

    const setProfileData = (data) => {
        profileData = data;
        document.dispatchEvent(new CustomEvent('profile-data-updated', {
            detail: { profileData: data }
        }));
    };

    return {
        getIslogged,
        setLoginSucces,
        setLogoutSuccess,
        
        getAuthData,
        setAuthData,
        getProfileData,
        setProfileData
    }; */
})();

export default GlobalWs;