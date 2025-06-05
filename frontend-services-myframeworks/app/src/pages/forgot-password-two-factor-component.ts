import { RouterConfig } from '../router/Router';
import { BaseComponent } from "../frameworks/base-component";
import { verify2FA } from "../services/api.2fa";
import { TwoFactorAuthFormData } from '../types/forms.type';
import { twoFactorAuthConstraint } from '../utils/constraints';

export class ForgotPasswordTwoFactor extends BaseComponent<{}, { form2FA: TwoFactorAuthFormData }> {

  constructor() {
    super({ });
    this.setApiErrorHandler(400, {
      message: 'Invalid 2FA code".',
     action: (error) => {
        //console.error('Unauthorized error:', error);
        // Rediriger vers la page de connexion
        console.log('redirecting to /forgot-password page');
       this.router.navigate('/forgot-password');
       }
    });
    this.setApiErrorHandler(401, {
      message: 'Unauthorized. Please log in again.',
     action: (error) => {
        //console.error('Unauthorized error:', error);
        // Rediriger vers la page de connexion
        console.log('redirecting to /forgot-password page');
       this.router.navigate('/forgot-password');
       }
    });
    this.setApiErrorHandler(500, {
      message: 'Internal server error. Please try again.',
     action: (error) => {
        //console.error('Unauthorized error:', error);
        // Rediriger vers la page de connexion
        console.log('redirecting to /forgot-password page');
       this.router.navigate('/forgot-password');
       }
    });
  }
 
  connectedCallback(): void {
    this.render();

    const formHandler = this.addForm('form2FA');
    formHandler?.addValidation(twoFactorAuthConstraint);

    this.attachEvent(this, '#verify2faBtn', 'click', this.handleVerify2FACode.bind(this));
    this.handle2FAInput();
  }

  async handleVerify2FACode(e: Event) {
    e.preventDefault();

    const formHandler = this.getFormHandler('form2FA');
    if (!formHandler?.validateForm()) {
      console.log('Form validation failed', formHandler?.getFormData().code);
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }

    const formData = formHandler.getFormData();
    try {
      const result = await verify2FA(formData.code, true);
      console.log('2FA verification successful:', result);
      const router = RouterConfig.getInstance();
      router.navigate('/reset-password');
    } catch (error) {
      //console.error('2FA verification failed:', error);
      //this.showMessage('Invalid 2FA code. Please try again.', 'error');
      this.apiErrorHandler(error); // Gérer les erreurs
    }
  }

  handle2FAInput() {
    const inputs = document.querySelectorAll<HTMLInputElement>(".code-input");
  const hiddenCodeInput = document.querySelector<HTMLInputElement>("#hiddenCode");
    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus(); // Passer au champ suivant
        }

              // Mettre à jour le champ hidden
      if (hiddenCodeInput) {
        hiddenCodeInput.value = Array.from(inputs)
          .map((input) => input.value.trim())
          .join("");
      }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && index > 0) {
          inputs[index - 1].focus(); // Revenir au champ précédent
        }
        if (e.key === "Enter" && index === inputs.length - 1) {
          this.handleVerify2FACode(e); // Soumettre le formulaire
        }
      });
    });
  }

  render() {
    this.innerHTML = `
      <form id="form2FA" class="form-container">
        <h2 class="form-title">Enter the 2FA Code</h2>
         <div id="message-box" class="form-error">ici</div>
        <p class="text-center mb-4">${this.t("AF.CODEPLS")}</p>
        <div id="code-error" class="form-error"></div>
        <input type="hidden" id="hiddenCode" name="code" value="" />
        <div id="2faCodeContainer" class="code-input-container">
          <input name="code_1" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_2" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_3" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_4" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_5" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_6" type="text" maxlength="1" class="form-text-input code-input" />
        </div>
        <button id="verify2faBtn" type="submit" class="btn">Verify 2FA Code</button>
      </form>
    `;
  }
}