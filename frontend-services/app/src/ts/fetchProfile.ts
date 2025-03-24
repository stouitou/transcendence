import { setState } from "./state";

export async function fetchProfileData() {

	try {
		const response = await fetch(`/api/users/me`);
		if (response.ok) {
			const profileData = await response.json();
			const { avatar, name, role, created_at } = profileData;
			setState({ user: { avatar, name, role, createdAt: created_at }, isLoggedIn: true });
			return { avatar, name, role, createdAt: created_at };
		} else {
			console.error('[debug] Failed to fetch profile data');
		}
	} catch (error) {
		console.error('Error fetching profile data:', error);
	}
}