import { apiRequest } from "../frameworks/apiRequest";
import { User } from "../types/types";

/**
 * Profile Users Update Name
 */
export const updateProfileName = async (user: Partial<User>): Promise<User | void> => {
  const url = `/api/users/me`;
  return apiRequest<User | void>(url, 'PUT', user);
}

/**
 * Profile Users Update Avatar
 */
export const uploadProfileAvatar = async (formData: FormData): Promise<User | void> => {
	  const url = `/api/users/me/upload-avatar`;
	  console.log("uploadProfileAvatar",formData)
	  return apiRequest<User | void>(url, 'POST', formData,{},true,false);
}

/**
 * Profile Users Delete
 */
export const  updateProfileDeleteMe = async (): Promise<User | void> => {
  const url = `/api/users/me`;
  return apiRequest<User | void>(url, 'DELETE', {});
}

export interface UpdatePassword {
	oldPassword: string;
	newPassword: string;
}
/**
 * Update user password
 * @param data :UpdatePassword {oldPassword: string,newPassword: string}
 * @returns void or { message:string } 
 */
export const updatePassword = async (data: Partial<UpdatePassword>): Promise<{message:string} | void> => {
	try {
		const res = await fetch('/api/auth/csrf');
        const { csrfToken } = await res.json();
		const response = await fetch(`/api/users/me/updatePassword`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ ...data }),
        });
		if (response.ok) {
			//204 no content
			if (response.status === 204) {
				return { message: 'Password updated successfully' };
			}
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