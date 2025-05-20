import { BaseComponent } from "../frameworks/base-component";
import { forgotPassword } from "../services/api.auth";
import { ForgotPasswordFormData } from "../types/forms.type";
import { forgotpasswordonstraint } from "../utils/constraints";


export class ForgotPasswordRequest extends BaseComponent<{}, { formLogin: ForgotPasswordFormData }> {
  connectedCallback(): void {
    this.render();

    const formHandler = this.addForm('formLogin');
    formHandler?.addValidation(forgotpasswordonstraint );

    this.attachEvent(this, '#formLogin', 'submit', this.handleSubmit.bind(this));
  }

  async handleSubmit(e: Event) {
    e.preventDefault();

    const formHandler = this.getFormHandler('formLogin');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }

    try {
      const formData = formHandler.getFormData();
      const loginToken = await forgotPassword(formData.email);
      console.log('Login successful:', loginToken);

      if (loginToken.twoFactorRequired) {
        console.log('Two-factor authentication required');
        //const router = RouterConfig.getInstance();
        this.router.navigate('/forgot-password-2fa'); // Naviguer vers le composant 2FA
      }
    } catch (error) {
      console.error('Login failed:', error);
	   this.apiErrorHandler(error);
     // this.showMessage('An unexpected error occurred. Please try again later.', 'error');
    }
  }

  render() {
    this.innerHTML = `
      <form id="formLogin" class="form-container">
        <h2 class="text-3xl font-bold text-center mb-6">Forgot Password</h2>

        <div id="message-box" class="font-bold text-center mb-4"></div>

        <p class="text-center mb-4">Please enter your email address to reset your password.</p>
        <div id="email-error" class="font-bold text-center mb-4"></div>
        <label for="email" class="block mb-2">Email:</label>
        <input id="email" name="email" type="email" class="form-text-input" placeholder="name@student.42.fr" required />
        <button id="loginBtn" type="submit" class="btn">Reset Password</button>
      </form>
    `;
  }
}