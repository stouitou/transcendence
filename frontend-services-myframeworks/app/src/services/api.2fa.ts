import { apiRequest } from "../frameworks/apiRequest";

export type TwoFA = {
	provider: "local",
	provider_id: string,
	two_factor_auth: boolean,
	two_factor_auth_method: "email"|"totp",
}

export const get2FADetail = async (): Promise<TwoFA> => {
  return apiRequest<TwoFA>("/api/users/me/2fa/status");
};

export const enable2FA = async (enable: boolean, method: string): Promise<void> => {
  return apiRequest<void>("/api/users/me/2fa/enable", "PUT", { enable, method });
};

export const disable2FA = async (): Promise<void> => {
  return apiRequest<void>("/api/users/me/2fa/disable", "PUT",{});
};

export const verify2FA = async (code: string, isforce: boolean = false): Promise<any> => {
  return apiRequest<any>("/api/auth/2fa/verify", "POST", { code, isforce });
};