import { FieldValidation } from '../frameworks/base-form';
import { EditAvatarFormData, EditDeleteUserFormData, EditNameFormData, EditRoleFormData, EditToggleTwoFAFormData, ForgotPasswordFormData, LoginFormData, ProfileUpdateDeleteFormData, ProfileUpdateNameFormData, ProfileUpdatePasswordFormData, RegisterFormData, ResetPasswordFormData, TwoFactorAuthFormData } from '../types/forms.type';
import { checkboxValidator, emailValidator, passwordValidator } from './validators';


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


/**
 * constrain for AdminUsersFormData
 */
export const admineditnameconstraint: { [fieldName in keyof EditNameFormData]: FieldValidation } = {
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
	}
}

export const admineditroleconstraint: { [fieldName in keyof EditRoleFormData]: FieldValidation } = {
	role: {
		required: true,
		type: 'text',
		constraint: {
		minLength: 2,
		maxLength: 20,
		allowedPattern: 'a-zA-Z',
		},
		message: 'Please enter a valid role.',
		messageConstraint: true,
	}
}
export const admineditAvatarconstraint: { [fieldName in keyof EditAvatarFormData]: FieldValidation } = {
	avatar: {
		required: true,
		type: 'file',
		constraint: {
			maxFileSize: 1024 * 1024, // 1 Mo
			allowedMimeTypes: ['image/png', 'image/jpeg'],
			maxFiles: 1,
		},
		message: 'Please select a valid image (PNG/JPEG, max 1MB).',
		messageConstraint: true,
	}
}

export const adminedittoggle2faconstraint: { [fieldName in keyof EditToggleTwoFAFormData]: FieldValidation } = {
	id: {
		required: true,
		type: 'text',
		constraint: {
		minLength: 1,
		maxLength: 20,
		allowedPattern: '0-9',
		},
		message: 'Please enter a valid id.',
		messageConstraint: true,
	},
	confirm: {
		required: true,
		type: 'checkbox',
		customValidator: checkboxValidator,
		message: 'Please confirm the deletion.',
		messageConstraint: true,
	}
}

export const adminedeletuserconstraint: { [fieldName in keyof EditDeleteUserFormData]: FieldValidation } = {
	id: {
		required: true,
		type: 'text',
		constraint: {
		minLength: 1,
		maxLength: 20,
		allowedPattern: '0-9',
		},
		message: 'Please enter a valid role.',
		messageConstraint: true,
	},
	confirm: {
		required: true,
		type: 'checkbox',
		customValidator: checkboxValidator,
		message: 'Please confirm the deletion.',
		messageConstraint: true,
	}
}


export const profileUpdatePasswordconstraint: { [fieldName in keyof ProfileUpdatePasswordFormData]: FieldValidation } = {
    oldPassword: {
	required: true,
	type: 'password',
	message: 'Please enter a valid password.',
	messageConstraint: true,	
  },
  newPassword: {
	required: true,
	type: 'password',
	constraint: {
	  missMatch: 'oldPassword', // Vérifie si le champ correspond au champ mot de passe
	},
	customValidator: passwordValidator,
	message: 'Please enter a valid password.',
	messageConstraint: true,
  },
  confirmPassword: {
	required: true,
	type: 'password',
	constraint: {
	  match: 'newPassword', // Vérifie si le champ correspond au champ mot de passe
	},
	message: 'Please enter a valid password.',
	messageConstraint: true,
  },
}

export const profileUpdateNameconstraint: { [fieldName in keyof ProfileUpdateNameFormData]: FieldValidation } = {
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
	}
}

export const profileUpdateAvatarconstraint: { [fieldName in keyof EditAvatarFormData]: FieldValidation } = {
	avatar: {
		required: true,
		type: 'file',
		constraint: {
			minFileSize: 1024, // 1 Ko
			maxFileSize: 1024 * 1024, // 1 Mo
			allowedMimeTypes: ['image/png', 'image/jpeg'],
			maxFiles: 1,
		},
		message: 'Please select a valid image (PNG/JPEG, max 1MB).',
		messageConstraint: true,
	}
}

export const profileUpdateDeleteconstraint: { [fieldName in keyof ProfileUpdateDeleteFormData]: FieldValidation } = {
	confirm: {
		required: true,
		type: 'checkbox',
		customValidator: checkboxValidator,
		message: 'Please confirm the deletion.',
		messageConstraint: true,
	}
}