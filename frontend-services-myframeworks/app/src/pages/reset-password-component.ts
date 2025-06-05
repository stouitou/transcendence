import {  fetchProfileData, resetPassword } from '../services/api.auth';
import { BaseComponent } from "../frameworks/base-component";
import  { UserContext } from "../globalstate/GlobalState";
import { ResetPasswordFormData } from '../types/forms.type';
import { resetpasswordconstraint } from '../utils/constraints';

export class ResetPassword extends BaseComponent<{},{formResetPassword:ResetPasswordFormData}> {
  constructor() {
    super({});
  }
  connectedCallback() {
    this.render();
    // attach the form handler to the form
    const formHandler = this.addForm('formResetPassword');
    // add the validation constraints to the form handler
    formHandler?.addValidation(resetpasswordconstraint);
    // attach the event handler to the submit button  form
   this.attachEvent(this, '#formResetPassword', 'submit', this.handleSubmit.bind(this));

  //  this.attachEvent(this, '#resetPasswordBtn', 'click', this.handleSubmit.bind(this));
    // attach a custom error handler for the form
    this.setApiErrorHandler(400, {
      message: 'Bad request. Please check your input.',
     action: (error) => { this.showMessage(error.message, 'error'); }
    });    
  }
  handleSubmit = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formResetPassword');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
       const formData = formHandler.getFormData();
			const loginToken = await  resetPassword(formData.password);
      console.log('Login resetPassword:', loginToken);
			const data = await fetchProfileData();
      if (!data) {
        return;
      }
      UserContext().setUser(data);
      UserContext().setLoginSuccess(loginToken.token);

      console.log('Reset password successful');
      this.router.navigate('/');
		} catch (error) {
			console.error('Login failed:', error);
			//alert('Login failed. Please try again.');
      this.apiErrorHandler(error);
		}
  }

  render() {
      this.innerHTML = `
      <form id=formResetPassword class="form-container">
            <h2 class="form-title">Reset Password</h2>
            <div id="message-box" class="form-error"></div>
            <p class="text-center mb-4">Please enter your email address to reset your password.</p>
            <div>
              <label for="password" class="form-label">${this.t("AUTH.PWD")}:</label>
              <div id="password-error" class="form-error"></div>
              <input
                id="password"
                type="password"
                name="password"
                class="form-text-input"
                placeholder="***********"
                required
                minlength="8"
              />
            </div>
  
            <div>
              <label for="confirmPassword" class="form-label">${this.t("AUTH.PWD")}:</label>
              <div id="confirmPassword-error" class="form-error"></div>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                class="form-text-input"
                placeholder="***********"
                required
                minlength="8"
              />
            </div>
           
            <button
                id="resetPasswordBtn"
                type="submit"
                class="btn"
                >
                ${this.t("AUTH.RESET")}
            </button>
        </form>
    `;    
  } 
}