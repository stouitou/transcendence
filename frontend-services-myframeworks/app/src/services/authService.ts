export interface RegisterData {
    name: string;
    email: string;
    password: string;
}
export interface LoginData {
    email: string;
    password: string;
}
export const registerUser = async (data: RegisterData): Promise<void> => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to register');
    }

    // Handle the response as needed
    const result = await response.json();
    console.log('Registration successful:', result);
};

export const loginUser = async (data: LoginData): Promise<{ twoFactorRequired: boolean|null, tempToken:any|null,token:any|null}> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to login');
    }

    // Handle the response as needed
    const result = await response.json();
    console.log('loginUser successful:', result);
    return result;
};


export const fetchProfileData = async (): Promise<any |void> => {

	try {
		const response = await fetch(`/api/users/me`);
		if (response.ok) {
			const profileData = await response.json();
		/* 	const { avatar, name, role, created_at } = profileData; */
        console.log('Profile data:', profileData);
		//	setUser(profileData);
        return profileData;
		} else {
			throw ('[debug] Failed to fetch profile data');
		}
	} catch (error) {
		console.error('Error fetching profile data:', error);
	}
}



export const logoutUser = async (): Promise<void> => {
    const response = await fetch(`/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
		body: JSON.stringify({  })
    });
    if (response.ok) {
        const profileData = await response.json();
        console.log('Logout successful:', profileData);
    }
    else {
        throw new Error('Failed to logout');
    }
}

export type LoginProvider = 'google' | 'github' | '42api';
export const loginWithProvider = async (provider: LoginProvider): Promise<void> => {
    console.log(`Logging in with ${provider}`);
    window.location.href = `/api/auth/${provider}`;
};