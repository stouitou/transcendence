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
            <h2 class="text-3xl font-bold text-center mb-6">Reset Password</h2>
            <div id="message-box" class="font-bold text-center mb-4"></div>
            <p class="text-center mb-4">Please enter your email address to reset your password.</p>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password:</label>
              <div id="password-error" class="font-bold text-center mb-4"></div>
              <input
                id="password"
                type="password"
                name="password"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="***********"
                required
                minlength="8"
              />
            </div>
  
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password:</label>
              <div id="confirmPassword-error" class="font-bold text-center mb-4"></div>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Reset Password
            </button>
        </form>
    `;    
  } 
}