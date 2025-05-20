import { User } from "../types/types";

export const uploadAvatar = async (formData: FormData): Promise<User | void> => {
  try {
	const res = await fetch('/api/auth/csrf');
	const { csrfToken } = await res.json();
	const response = await fetch('/api/users/me/upload-avatar', { ///api/users/me/avatar'
		method: 'POST',
		headers: {
			'x-csrf-token': csrfToken,
		},
		body: formData,
	});

	if (response.ok) {
	  const data = await response.json();
	  return data;
	} else {
	  throw new Error('Failed to upload avatar');
	}
  } catch (error) {
	console.error('Error uploading avatar:', error);
	throw new Error('Error uploading avatar');
  }
}

export const updateProfile = async (data: Partial<User>): Promise<User | void> => {
	try {
		const res = await fetch('/api/auth/csrf');
        const { csrfToken } = await res.json();
		const response = await fetch(`/api/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ ...data }),
        });
		if (response.ok) {
            const profileData = await response.json();
            console.log('[updateProfile]Profile updated:', profileData);
            return profileData;
        } else {
            console.error('[updateProfile]Failed to update profile');
			throw new Error('Failed to update profile');
        }
    } catch (error) {
   		console.error('[updateProfile] Error updating profile:', error);
		throw new Error('[updateProfile] Error to update profile');
  }
}