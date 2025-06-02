export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface TwoFactorAuthFormData {
  code: string;
  code_1: string;
  code_2: string;
  code_3: string;
  code_4: string;
  code_5: string;
  code_6: string;
}

export interface EditNameFormData {
    name: string;
}
export interface EditRoleFormData {
    role: string;
}
export interface EditAvatarFormData {
  avatar: File;
}
export interface EditDeleteUserFormData {
  id: string;
  confirm: boolean;
}
export interface EditToggleTwoFAFormData {
  id: string;
  confirm: boolean;
}
export type AdminUsersFormData = {
  formEditName: EditNameFormData;
  formEditRole: EditRoleFormData;
  formEditAvatar: EditAvatarFormData;
  formToggle2FA: EditToggleTwoFAFormData;
  formDeleteUser: EditDeleteUserFormData;
};


export interface ProfileUpdateNameFormData  {
  name: string;
};
export interface ProfileUpdateAddFriendFormData  {
  friendName: string;
};
export interface ProfileUpdateRemoveFriendFormData  {
 friendId: number;
};
export interface ProfileUpdatePasswordFormData  {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export interface ProfileUpdateDeleteFormData  {
  confirm: boolean;
};
export type ProfileUpdateFormData ={
  formAddfriend: ProfileUpdateAddFriendFormData,
  formRemoveFriend: ProfileUpdateRemoveFriendFormData,
  formUpdateName: ProfileUpdateNameFormData,
  formUpdateAvatar: EditAvatarFormData,
  formUpdatePassword: ProfileUpdatePasswordFormData,
  formDeleteUser: ProfileUpdateDeleteFormData,
}

export interface SettingsUpdateLangFormData  {
  lang: "fr" | "en";
};
export type SettingsFormData ={
  formUpdateLang: SettingsUpdateLangFormData,
}

/* GameSettings */
export interface SettingsGameTypeFormData  {
  type: "local" | "remote";
};
export interface SettingsGameFormatFormData  {
  format: "classic" | "tournament";
};
export interface SettingsGamePlayerFormData  {
  is_max_players: string;
  is_format: string;
  type: "local" | "remote";
  avatar: string;
  display_name: string;
  is_IA: string;
  user: number | null;
};
export interface SettingsGameMaxPlayerFormData  {
  max_players: number;
};
export type SettingsGameFormData ={
  formSetGameType: SettingsGameTypeFormData,
  formSetGameFormat: SettingsGameFormatFormData,
  addPlayerForm: SettingsGamePlayerFormData,
  formSetGameMaxPlayer: SettingsGameMaxPlayerFormData,
}