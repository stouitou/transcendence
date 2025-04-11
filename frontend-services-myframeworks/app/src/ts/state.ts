interface AppState {
    user: { avatar: string, name: string, role: string, createdAt: string } | null;
	isLoggedIn: boolean;
}

const state: AppState = {
    user: null,
    isLoggedIn: false,
};

export function getState(): AppState {
    return state;
}

export function setState(newState: Partial<AppState>) {
    Object.assign(state, newState);
    document.dispatchEvent(new CustomEvent('stateChange', { detail: state }));
}