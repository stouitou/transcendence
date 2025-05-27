export const passwordValidator = (value: string): string[] => {
  const errors: string[] = [];
  if (value.length < 8) errors.push("Le mot de passe doit contenir au moins 8 caractères.");
  if (!/[a-z]/.test(value)) errors.push("Au moins une lettre minuscule est requise.");
  if (!/[A-Z]/.test(value)) errors.push("Au moins une lettre majuscule est requise.");
  if (!/[0-9]/.test(value)) errors.push("Au moins un chiffre est requis.");
  if (!/[*/+\-=@_]/.test(value)) errors.push("Au moins un caractère spécial (* / + - = @ _) est requis.");
  return errors;
};
export const emailValidator = (value: string): string[] => {
  const errors: string[] = [];
  if (!value) errors.push("L’adresse e-mail est requise.");
  if (value.length < 4) errors.push("L’adresse e-mail doit contenir au moins 4 caractères.");
  if (value.length > 50) errors.push("L’adresse e-mail ne doit pas dépasser 50 caractères.");
  if (/\s/.test(value))errors.push("L’adresse e-mail ne doit pas contenir d’espaces.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push("Le format de l’adresse e-mail est invalide.");

  return errors;
};

export const checkboxValidator = (value: string): string[] => {
  const errors: string[] = [];
  if (!value) errors.push("FORM.GENERIC.REQUIRED");
  return errors;
}

export const SettingLangValidator = (value: string): string[] => {
  const errors: string[] = [];
  if (!value) errors.push("FORM.SETTINGS.LANG.REQUIRED");
  const allowedLangs = ['fr', 'en', 'es'];
  // if (!allowedLangs.includes(value)) errors.push("La langue sélectionnée n'est pas valide.");
   if (!allowedLangs.includes(value)) errors.push("FORM.SETTINGS.LANG.INVALID");
  
  return errors;
};