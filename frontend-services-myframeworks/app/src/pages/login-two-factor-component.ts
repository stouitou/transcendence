import { BaseComponent } from "../frameworks/base-component";
import { verify2FA } from "../services/api.2fa";
import { TwoFactorAuthFormData } from '../types/forms.type';
import { twoFactorAuthConstraint } from '../utils/constraints';
import { fetchProfileData } from '../services/api.auth';
import { UserContext } from '../globalstate/GlobalState';

export class LoginTwoFactor extends BaseComponent<{}, { form2FA: TwoFactorAuthFormData }> {

  constructor() {
    super({ });
    this.setApiErrorHandler(400, {
      message: 'Invalid 2FA code".',
     action: (error) => {
        // Rediriger vers la page de connexion
       this.router.navigate('/login');
       }
    });
    this.setApiErrorHandler(401, {
      message: 'Unauthorized. Please log in again.',
     action: (error) => {
        // Rediriger vers la page de connexion
       this.router.navigate('/login');
       }
    });
    this.setApiErrorHandler(500, {
      message: 'Internal server error. Please try again.',
     action: (error) => {
        // Rediriger vers la page de connexion
       this.router.navigate('/login');
       }
    });
  }
 
  connectedCallback(): void {
    this.render();

    const formHandler = this.addForm('form2FA');
    formHandler?.addValidation(twoFactorAuthConstraint);

  //  this.attachEvent(this, '#verify2faBtn', 'click', this.handleVerify2FACode.bind(this));
    this.attachEvent(this, '#form2FA', 'submit', this.handleVerify2FACode.bind(this));
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
      const data2FA = await verify2FA(formData.code);
      console.log('2FA verification successful:', data2FA);
      const data = await fetchProfileData();
      if (!data) {
        return;
      }
      UserContext().setUser(data);
      UserContext().setLoginSuccess(data2FA.token);
      this.router.navigate('/');
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
      });
    });
  }

  render() {
    this.innerHTML = `
          <style>
  .qr-code-container {
    text-align: center;
    margin-top: 20px;
  }
  .qr-code-image {
    max-width: 200px;
    margin: 0 auto;
    display: block;
  }
    .code-input-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.code-input {
  width: 40px;
  height: 40px;
  text-align: center;
  font-size: 18px;
  border: 2px solid green;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
}

.code-input:focus {
  border-color: darkgreen;
  box-shadow: 0 0 5px rgba(0, 128, 0, 0.5);
}


</style>
      <form id="form2FA" class="form-container">
        <h2 class="text-2xl font-bold text-center mb-4">Enter the 2FA Code</h2>
         <div id="message-box" class="font-bold text-center mb-4">ici</div>
        <p class="text-center mb-4">Please enter the 2FA code sent to your email or App</p>
        <div id="code-error" class="font-bold text-center mb-4"></div>
    <!--     <div id="code_1-error" class="font-bold text-center mb-4"></div>
         <div id="code_2-error" class="font-bold text-center mb-4"></div>
         <div id="code_3-error" class="font-bold text-center mb-4"></div>
         <div id="code_4-error" class="font-bold text-center mb-4"></div>
         <div id="code_5-error" class="font-bold text-center mb-4"></div>
         <div id="code_6-error" class="font-bold text-center mb-4"></div>-->
        <input type="hidden" name="code" id="hiddenCode" />
        <div id="2faCodeContainer" class="code-input-container">
          <input name="code_1" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_2" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_3" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_4" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_5" type="text" maxlength="1" class="form-text-input code-input" />
          <input name="code_6" type="text" maxlength="1" class="form-text-input code-input" />
        </div>
        <button id="verify2faBtn" type="submit" class="btn mt-4">Verify 2FA Code</button>
      </form>
    `;
  }
}