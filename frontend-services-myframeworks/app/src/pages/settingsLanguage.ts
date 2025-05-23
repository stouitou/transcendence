// src/components/SettingsLanguage.ts
import { BaseComponent } from "../frameworks/base-component";
import { SettingsFormData } from "../types/forms.type";
import { settingsditLangconstraint } from "../utils/constraints";

export class SettingsLanguage extends BaseComponent<{},SettingsFormData> {

  constructor() {
    super({});
  }
  attachAllForm() {
    // attach the form handler to the form
    const formHandlerEditName = this.addForm('formUpdateLang');
    
    // add the validation constraints to the form handler
    formHandlerEditName?.addValidation(settingsditLangconstraint);

    // attach the event handler to the form #lang onChange
    this.attachEvent(this, '#lang', 'change', this.handleLanguageChange.bind(this));
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `    
      <div class="p-4">
      <form id="formUpdateLang" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <label for='lang' class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          ${this.t("LANGUAGE.CHOOSE")}
        </label>
        <div id="lang-error" class="text-red-500 text-sm mb-2"></div>
        <select id="lang" name='lang' class="rounded px-3 py-2 border dark:bg-gray-800 dark:text-white">
          <option value="fr" ${this.currentLang === 'fr' ? 'selected' : ''}>${this.t("LANGUAGE.FR")}</option>
          <option value="en" ${this.currentLang  === 'en' ? 'selected' : ''}>${this.t("LANGUAGE.EN")}</option>
          <option value="de" >de</option>
        </select>
        <div id="message-box" class="font-bold text-center mb-4"></div>
        </form>
      </div>
    `;
	  this.attachAllForm();
  }
  
  handleLanguageChange = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formUpdateLang');
    if (!formHandler?.validateForm()) {
      this.showMessage(this.t('FORM.GENERIC.ERROR'), 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
      this.setLang(formData.lang);
      this.showMessage(`${this.t('FORM.GENERIC.SUCCESS')} ${formData.lang}`, 'success');
    } catch (error) {
        console.error('SETTING failed:', error);
    }
  }
}
