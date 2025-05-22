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

export const loginUser = async (data: LoginData): Promise<void> => {
    const response = await fetch('/api/auth/login', {
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
    console.log('loginUser successful:', result);
};


export async function updateProfileData(formData: FormData) {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://localhost:4433/api/users/me", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  
    if (!res.ok) {
      throw new Error("Échec de la mise à jour");
    }
  
    return res.json();
  }
  
  

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
    await fetch(`/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
		body: JSON.stringify({  })
    });
}

export type LoginProvider = 'google' | 'github' | '42api';
export const loginWithProvider = async (provider: LoginProvider): Promise<void> => {
    console.log(`Logging in with ${provider}`);
    window.location.href = `/api/auth/${provider}`;
};