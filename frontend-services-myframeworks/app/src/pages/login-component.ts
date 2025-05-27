import { loginUser, fetchProfileData } from '../services/api.auth';
import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { LoginProvider } from '../components/login-provider-component';
import { LoginFormData } from '../types/forms.type';
import { loginconstraint } from '../utils/constraints';

if (!customElements.get('login-provider-component'))
customElements.define('login-provider-component', LoginProvider);
export class Login extends BaseComponent<{}, { formLogin: LoginFormData }> {
  constructor() {
    super({});
  }
  connectedCallback() {
    this.render();
    // attach the form handler to the form
    const formHandler = this.addForm('formLogin');
    // add the validation constraints to the form handler
    formHandler?.addValidation(loginconstraint);
    // attach the event handler to the submit button  form
   this.attachEvent(this, '#formLogin', 'submit', this.handleSubmit.bind(this));

  //  this.attachEvent(this, '#loginbtn', 'click', this.handleSubmit.bind(this));
    // attach a custom error handler for the form
    this.setApiErrorHandler(400, {
      message: 'Bad request. Please check your input.',
     action: (error) => { this.showMessage(error.message, 'error'); }
    });    
  }

  handleSubmit = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formLogin');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
			const loginToken = await  loginUser(formData);
      const { twoFactorRequired} = loginToken;
      console.log('Login 2FA token:', loginToken);
      // Check if two-factor authentication is required
      if (twoFactorRequired) {
        console.log('Two-factor authentication required');
        this.router.navigate('/login-2fa');
        return;
      }
      // If not, continue proceed with the login
			const data = await fetchProfileData();
      UserContext().setUser(data);
      UserContext().setLoginSuccess(loginToken.token);
      this.router.navigate('/');
		} catch (error) {
			console.error('Login failed:', error);
			alert('Login failed. Please try again.');
		}
  }

  render() {    
      this.innerHTML = `
      <form id=formLogin class="form-container">
            <h2 class="text-3xl font-bold text-center mb-6">${this.t('AUTH.LOGIN')}</h2>
         <div id="message-box" class="font-bold text-center mb-4"></div>
            <label for="email" class="block  mb-2">Email:</label>
        <div id="email-error" class="font-bold text-center mb-4"></div>
            <input
                id="email"
                type="email"
                name="email"
                class="form-text-input"
                placeholder="name@student.42.fr"
                autocomplete="email"
                required
            />
            <label for="password" class="block  mb-2">Password:</label>
        <div id="password-error" class="font-bold text-center mb-4"></div>
            <input
                id="password"
                type="password"
                name="password"
                class="form-text-input"
                placeholder="********"
                autocomplete="current-password"
                required
            />
            <button
                id="loginBtn"
                type="submit"
                class="btn"
                >
                Login
            </button>
            <span class="text-sm text-center block mt-4">
                Don't have an account? <a href="/register" class="text-blue-500 hover:underline">Register</a>
            </span>
            <span class="text-sm text-center block mt-4">
                Forgot your password? <a href="/forgot-password" class="text-blue-500 hover:underline">Reset Password</a>
            </span>
        </form>
        <login-provider-component />
    `;
  }
}