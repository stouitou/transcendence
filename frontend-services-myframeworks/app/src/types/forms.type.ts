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