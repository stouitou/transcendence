import { TranslationKey } from "./i18n/index";

export interface FieldConstraint {
  minLength?: number;
  maxLength?: number;
  allowedPattern?: string /* | RegExp */; // Pour les caractères autorisés (ex: email, password)
  match?: string; // Pour vérifier si un champ correspond à un autre (ex: confirmPassword)
  missMatch?: string; // Pour vérifier si un champ ne correspond pas à un autre (ex: confirmPassword)
  min?: number; // Pour les nombres (ex: age)
  max?: number; // Pour les nombres (ex: age)
  minDate?: Date; // Pour les dates
  maxDate?: Date; // Pour les dates
  // Pour les fichiers
  minFileSize?: number; // en octets
  maxFileSize?: number; // en octets
  allowedMimeTypes?: string[]; // ex: ['image/png', 'image/jpeg']
  maxFiles?: number;
}

export interface FieldValidation {
  required?: boolean;
  type?: 'email' | 'password' | 'text' | 'number' | 'tel' | 'url' | 'checkbox' | 'file' | 'select' | 'textarea';
  constraint?: FieldConstraint;
  message: string;
  messageConstraint?: boolean;
  sanitize?: boolean;
  customValidator?: (value: string) => string[]; // retourne une liste d'erreurs
}

export class FormHandler<TFormData extends Record<string,any>> {
  private formElement: HTMLFormElement;
  private validations: { [fieldName in keyof TFormData]?: FieldValidation } = {};
  private errorMessages: { [fieldName in keyof TFormData]?: string } = {};
  private attachedEvents: { field: HTMLInputElement; event: string; handler: EventListener }[] = [];

  constructor(formElement: HTMLFormElement,private t:(key: TranslationKey)=> string) {
    this.formElement = formElement;
  }

	// Nettoyer les événements attachés
  cleanEventListeners() {
    this.attachedEvents.forEach(({ field, event, handler }) => {
      field.removeEventListener(event, handler);
    });
    this.attachedEvents = [];
  }

  // Ajouter des validations pour les champs
  addValidation(validations: { [fieldName in keyof TFormData]: FieldValidation }) {
    this.validations = { ...this.validations, ...validations };
	//console.log('Validations added:', this.formElement);

    Object.keys(validations).forEach((fieldName) => {
      const field = this.formElement.querySelector<HTMLInputElement>(`[name="${fieldName}"]`);
      if (!field) {
        console.warn(`Field "${fieldName}" not found in the form.`);
        return;
      }

      // Ajouter des écouteurs pour valider les champs en temps réel
     // field.addEventListener('input', () => this.validateField(fieldName));

      const handler = () => this.validateField(fieldName);
      field.addEventListener('input', handler);
      this.attachedEvents.push({ field, event: 'input', handler });
    });
  }

  // Valider un champ spécifique
  private validateField(fieldName: keyof TFormData): boolean {
    const field = this.formElement.querySelector<HTMLInputElement>(`[name="${String(fieldName)}"]`);
    const validation = this.validations[fieldName];

    if (!field || !validation) return true;

    // Gestion spécifique pour les fichiers
  if (field.type === 'file') {
    const files = field.files;
    const { required, constraint } = validation;

    if (required && (!files || files.length === 0)) {
      this.setError(fieldName, validation.message || 'This field is required.');
      return false;
    }

    if (files && files.length > 0 && constraint) {
      if (constraint.maxFiles && files.length > constraint.maxFiles) {
        this.setError(fieldName, `You can upload up to ${constraint.maxFiles} files.`);
        return false;
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (constraint.maxFileSize && file.size > constraint.maxFileSize) {
          this.setError(fieldName, `File size must be less than ${Math.round(constraint.maxFileSize/1024)} KB.`);
          return false;
        }
        if (constraint.allowedMimeTypes && !constraint.allowedMimeTypes.includes(file.type)) {
          this.setError(fieldName, `File type not allowed.`);
          return false;
        }
      }
    }
    this.clearError(fieldName);
    return true;
  }

    const value = field.value.trim();
   // console.log('value:', value);

    // Vérifier si le champ est requis
    if (validation.required && value === '') {
      this.setError(fieldName, validation.message || 'This field is required.');
      return false;
    }

    // Vérifier les contraintes
    if (validation.constraint) {
      const { minLength, maxLength, allowedPattern, match, missMatch } = validation.constraint;

      if (minLength && value.length < minLength) {
        this.setError(fieldName, `Minimum length is ${minLength} characters.`);
        return false;
      }

      if (maxLength && value.length > maxLength) {
        this.setError(fieldName, `Maximum length is ${maxLength} characters.`);
        return false;
      }
	  if (allowedPattern) {
     	 const regex = new RegExp(`^[${(allowedPattern)}]*$`);///^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		if (!regex.test(value)) {
			this.setError(fieldName, `Invalid characters used.`);
			return false;
		}
    }


      if (match) {
        const matchField = this.formElement.querySelector<HTMLInputElement>(`[name="${match}"]`);
        if (matchField && value !== matchField.value) {
          this.setError(fieldName, `This field must match ${match}.`);
          return false;
        }
      }
      if (missMatch) {
        const missMatchField = this.formElement.querySelector<HTMLInputElement>(`[name="${missMatch}"]`);
        if (missMatchField && value === missMatchField.value) {
          this.setError(fieldName, `This field must not match ${missMatch}.`);
          return false;
        }
      }
    }

	  if (validation.customValidator) {
			const errors = validation.customValidator(value);
		//	console.log('errors:', errors);
			if (errors.length > 0) {
				this.setError(fieldName, errors[0]); // tu peux en afficher plusieurs si tu veux
				return false;
			}
		}
    // Si tout est valide, effacer les erreurs
    this.clearError(fieldName);
    return true;
  }

  // Valider tout le formulaire
  validateForm(): boolean {
    let isValid = true;
    Object.keys(this.validations).forEach((fieldName) => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });
    return isValid;
  }

  // Récupérer les données du formulaire
/*   getFormData(): TFormData {
    const formData= {} as TFormData;//: { [key: string]: string } = {};
    const inputs = this.formElement.querySelectorAll<HTMLInputElement>('input, textarea, select');
    inputs.forEach((input) => {
      formData[input.name as keyof TFormData] = input.value.trim() as TFormData[keyof TFormData];
    });
    return formData;
  } */
 getFormData(): TFormData {
  const formData = {} as TFormData;
  const inputs = this.formElement.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, textarea, select');
  inputs.forEach((input) => {
    if (input.type === 'checkbox') {
      formData[input.name as keyof TFormData] = (input as HTMLInputElement).checked as any;
    } else if (input.type === 'file') {
      const files = (input as HTMLInputElement).files;
      formData[input.name as keyof TFormData] = files && files.length > 0 ? files[0] : null as any;
    } else if (input instanceof HTMLSelectElement && input.multiple) {
      const selected = Array.from(input.selectedOptions).map(opt => opt.value);
      formData[input.name as keyof TFormData] = selected as any;
    } else {
      formData[input.name as keyof TFormData] = input.value.trim() as any;
    }
  });
  return formData;
}

  // Afficher un message d'erreur pour un champ
  //private setError(fieldName:  keyof TFormData, message: string) {
  private setError(fieldName: keyof TFormData, messageKey: string, params?: Record<string, string | number>) {
    const field = this.formElement.querySelector<HTMLInputElement>(`[name="${String(fieldName)}"]`);
    const errorDiv = this.formElement.querySelector(`#${String(fieldName)}-error`);
    if (field) {
      field.classList.add('input-error');
    }
    const translated = this.t(messageKey as TranslationKey/* , params */)
    if (errorDiv) {
      errorDiv.textContent = translated;
      errorDiv.classList.add('error-visible');
    }
    this.errorMessages[fieldName] = translated;
  }

  // Effacer le message d'erreur pour un champ
  private clearError(fieldName: keyof TFormData) {
    const field = this.formElement.querySelector<HTMLInputElement>(`[name="${String(fieldName)}"]`);
    const errorDiv = this.formElement.querySelector(`#${String(fieldName)}-error`);
    if (field) {
      field.classList.remove('input-error');
    }
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.classList.remove('error-visible');
    }
    delete this.errorMessages[fieldName];
  }
}