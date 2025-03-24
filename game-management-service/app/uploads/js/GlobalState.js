const GlobalState = (() => {
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
            bubbles: true, // Permettre la propagation de l'événement
            composed: true, // Permettre la traversée des shadow DOM
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
    };
})();

export default GlobalState;