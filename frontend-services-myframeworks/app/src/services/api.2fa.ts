
export type TwoFA = {
	//id: 4,
	//otp?: string,
	//otpExpiration?: string,
	provider: "local",
	provider_id: string,
	two_factor_auth: boolean,
	two_factor_auth_method: "email"|"totp",
}

export const get2FADetail = async (id:number): Promise<TwoFA | void> => {
	try {
		const response = await fetch(`/api/auth/2fa/status`);
		if (response.ok) {
			const twofadetails = await response.json();
		console.log('twofadetails:', twofadetails);
		return twofadetails;
		} else {
			throw ('[debug] Failed to fetch twofadetails by id');
		}
	} catch (error) {
		console.error('Error fetching twofadetails by id data:', error);
	}
};

   export const enable2FA = async(enable:boolean,method:string) => {

    try {
      const response = await fetch(`/api/auth/2fa/enable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable, method }),
      });

      if (response.ok) {
		const data = await response.json();
		return data;
      } else {
       throw ('[debug] Failed to enable2FA ');
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
    }
  }

   export const disable2FA = async() => {

    try {
      const response = await fetch(`/api/auth/2fa/disable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ }),
      });

      if (response.ok) {
		const data = await response.json();
		return data;
      } else {
       throw ('[debug] Failed to disable2FA ');
      }
    } catch (error) {
      console.error("Error disable2FA 2FA:", error);
    }
  }

