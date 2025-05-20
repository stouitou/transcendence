import { FieldValidation } from '../frameworks/base-form';
import { ForgotPasswordFormData, LoginFormData, RegisterFormData, ResetPasswordFormData, TwoFactorAuthFormData } from '../types/forms.type';
import { emailValidator, passwordValidator } from './validators';


/*
 * This file contains the constraints for the form fields used in the application.
 * Each constraint is defined as an object with properties that specify the validation rules.
 * The constraints are used to validate user input in forms.
 */
/**
 * register form constraints
 */
export const registerconstraint: { [fieldName in keyof RegisterFormData]: FieldValidation } = {
  name: {
	required: true,
	type: 'text',
	constraint: {
	  minLength: 2,
	  maxLength: 20,
	  allowedPattern: 'a-zA-Z0-9_@.-',
	},
	message: 'Please enter a valid name.',
	messageConstraint: true,
  },
  email: {
	required: true,
	type: 'email',
	customValidator: emailValidator,
	message: 'Please enter a valid email address.',
	messageConstraint: true,
  },
  password: {
	required: true,
	type: 'password',
	customValidator: passwordValidator,
	message: 'Please enter a valid password.',
	messageConstraint: true,
  },
  confirmPassword: {
	required: true,
	type: 'password',
	constraint: {
	  match: 'password', // Vérifie si le champ correspond au champ mot de passe
	},
	message: 'Please enter a valid password.',
	messageConstraint: true,
  },
}

/**
 * login form constraints
 */
export const loginconstraint: { [fieldName in keyof LoginFormData]: FieldValidation } = {
  email: {
	required: true,
	type: 'email',
	customValidator: emailValidator,
	message: 'Please enter a valid email address.',
	messageConstraint: true,
  },
  password: {
	required: true,
	type: 'password',
	customValidator: passwordValidator,
	message: 'Please enter a valid password.',
	messageConstraint: true,
  },
}

/**
 * forgot password form constraints
 */

export const forgotpasswordonstraint: { [fieldName in keyof ForgotPasswordFormData]: FieldValidation } = {
	email: {
	required: true,
	type: 'email',
	customValidator: emailValidator,
	message: 'Please enter a valid email address.',
	messageConstraint: true,
	},
}
/**
 * forgot password form constraints
 */

export const resetpasswordconstraint: { [fieldName in keyof ResetPasswordFormData]: FieldValidation } = {
  password: {
	required: true,
	type: 'password',
	customValidator: passwordValidator,
	message: 'Please enter a valid password.',
	messageConstraint: true,
  },
  confirmPassword: {
	required: true,
	type: 'password',
	constraint: {
	  match: 'password', // Vérifie si le champ correspond au champ mot de passe
	},
	message: 'Please enter a valid password.',
	messageConstraint: true,
  },
}
/**
 * 2FA form constraints
 */
export const twoFactorAuthConstraint: { [fieldName in keyof TwoFactorAuthFormData]: FieldValidation } = {
	code: {
		required: true,
		type: 'text',
		constraint: {
			minLength: 6,
			maxLength: 6,
			allowedPattern: '0-9',
		},
		message: 'Please enter a valid 6-digit code.',
		messageConstraint: true,
		},
	code_1: {
		required: true,
		type: 'text',
		constraint: {
			minLength: 1,
			maxLength: 1,
			allowedPattern: '0-9',
		},
		message: 'Please enter a valid digit code.',
		messageConstraint: true,
		},
	code_2: {
		required: true,
		type: 'text',
		constraint: {
			minLength: 1,
			maxLength: 1,
			allowedPattern: '0-9',
		},
		message: 'Please enter a valid 6-digit code.',
		messageConstraint: true,
		},
	code_3: {
		required: true,
		type: 'text',
		constraint: {
			minLength: 1,
			maxLength: 1,
			allowedPattern: '0-9',
		},
		message: 'Please enter a valid 6-digit code.',
		messageConstraint: true,
		},
	code_4: {
		required: true,
		type: 'text',
		constraint: {
			minLength: 1,
			maxLength: 1,
			allowedPattern: '0-9',
		},
		message: 'Please enter a valid 6-digit code.',
		messageConstraint: true,
		},
	code_5: {
		required: true,
		type: 'text',
		constraint: {
			minLength: 1,
			maxLength: 1,
			allowedPattern: '0-9',
		},
		message: 'Please enter a valid 6-digit code.',
		messageConstraint: true,
		},
	code_6: {
		required: true,
		type: 'text',
		constraint: {
			minLength: 1,
			maxLength: 1,
			allowedPattern: '0-9',
		},
		message: 'Please enter a valid 6-digit code.',
		messageConstraint: true,
		},
	}
