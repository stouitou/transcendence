import { apiRequest } from "../frameworks/apiRequest";
import { User, UserStats } from "../types/types";

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
	  // console.log("uploadProfileAvatar",formData)
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
            // console.log('[updateProfile]Profile updated:', profileData);
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


/**
 * Profile Users Update Name
 */
export const getProfileStat = async (id:number): Promise<UserStats | void> => {
  const url = `/api/users/me/stats/${id}`;
  return apiRequest<UserStats | void>(url, 'GET');
}

/**
 * Profile Users Update Name
 */
export const getProfileById = async (id:string): Promise<User | void> => {
  const url = `/api/users/me/users/${id}`;
  return apiRequest<User | void>(url);
}

interface LeaderBoardUser {
  id: number;
  name: string;
  level: number;
  avatar: string;
}
export const getLeaderboard = async (): Promise<LeaderBoardUser[] | void> => {
  const url = `/api/users/me/leaderboard`;
  return apiRequest<LeaderBoardUser[] | void>(url, 'GET');
}


/**
 * Profile Users addfriendByUserName
 */
export const addfriendByUserName = async (friend:{friendName: string}): Promise<User | void> => {
  // console.log('friend name:', friend.friendName);
  const url = `/api/users/me/addFriendByUserName`;
  return apiRequest<User | void>(url, 'PUT', friend);
}
export const removeFriendById = async (friend:{friendId: number}): Promise<User | void> => {
  const url = `/api/users/me/removeFriendById`;
  return apiRequest<User | void>(url, 'PUT', friend);
}

