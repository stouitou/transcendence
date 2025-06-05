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
      this.showMessage(`${this.t('AUTH.ERR')}`, 'error');
      return;
    }
    try {
      const formData = formHandler.getFormData();
			const loginToken = await  loginUser(formData);
      const { twoFactorRequired} = loginToken;
      // console.log('Login 2FA token:', loginToken);
      // Check if two-factor authentication is required
      if (twoFactorRequired) {
        // console.log('Two-factor authentication required');
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
			//alert('Login failed. Please try again.');
      if (error instanceof Error) {
        this.showMessage(error.message, 'error');
      } else {
        this.showMessage('An unexpected error occurred. Please try again.', 'error');
      }
		}
  }

  render() {    
      this.innerHTML = `
      <form id=formLogin class="form-container">
        <h2 class="form-title">${this.t('AUTH.LOGIN')}</h2>
        <div id="message-box" class="form-error"></div>
        <label for="email" class="form-label">${this.t('AUTH.EMAIL')}</label>
        <div id="email-error" class="form-error"></div>
            <input
                id="email"
                type="email"
                name="email"
                class="form-text-input"
                placeholder="name@student.42.fr"
                autocomplete="email"
                required
            />
         <label for="password" class="form-label">${this.t('AUTH.PWD')}</label>
        <div id="password-error" class="form-error"></div>
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
                 ${this.t('AUTH.LOGIN')} 
            </button>
            <span class="form-footer">
                ${this.t('AUTH.NOACC')}  <a href="/register" class="form-footer-link"> ${this.t('AUTH.REGISTER')} </a>
            </span>
            <span class="form-footer">
                ${this.t('AUTH.NOPWD')} <a href="/forgot-password" class="form-footer-link"> ${this.t('AUTH.RESET')} </a>
            </span>
        </form>
        <login-provider-component />
    `;
  }
}