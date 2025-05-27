import { registerUser } from '../services/api.auth';
import { BaseComponent } from "../frameworks/base-component";
import { registerconstraint } from '../utils/constraints';
import { RegisterFormData } from '../types/forms.type';

export class Register extends BaseComponent<{},{formRegister:RegisterFormData}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
    // attach the form handler to the form
    const formHandler = this.addForm('formRegister');
    // add the validation constraints to the form handler
    formHandler?.addValidation(registerconstraint);
    // attach the event handler to the submit button    
    this.attachEvent(this, '#formRegister', 'submit', this.handleSubmit.bind(this));
    // attach a custom error handler for the form
    this.setApiErrorHandler(400, {
      message: 'Bad request. Please check your input.',
     action: (error) => { this.showMessage(error.message, 'error'); }
    });    
  }

  handleSubmit = async(e: Event)=> {
    e.preventDefault()
    const formHandler = this.getFormHandler('formRegister');
    if (!formHandler?.validateForm()) {
      this.showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    try {
       const formData = formHandler.getFormData();
			await  registerUser(formData);
      this.router.navigate('/login');
		} catch (error) {
			 //console.error('register failed:', error);
       this.apiErrorHandler(error);
		}
  }

  /*
   !! - for display the error message  from the api: 
    <div id="message-box" class="font-bold text-center mb-4"></div>

    !! - for display the error message for each field:
    <div id="name-error" class="font-bold text-center mb-4"></div>
    <input name="name" id="name" type="text" class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="SuP€rK@RoT" required />
  */

  render() {
    this.innerHTML = `
          <form id="formRegister" class="form-container">
            <h2 class="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">Register</h2>
             <div id="message-box" class="font-bold text-center mb-4"></div>
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name:</label>
               <div id="name-error" class="font-bold text-center mb-4"></div>
              <input
                id="name"             
                type="text"
                name="name"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SuP€rK@RoT"
                autocomplete="name"
                required
              />
            </div>
  
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email:</label>
              <div id="email-error" class="font-bold text-center mb-4"></div>
              <input
                id="email"
                type="email"
                name="email"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="name@student.42.fr"
                autocomplete="email"
                required
              />
            </div>
  
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password:</label>
              <div id="password-error" class="font-bold text-center mb-4"></div>
              <input
                id="password"
                type="password"
                name="password"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
                autocomplete="off"
                required
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
                placeholder="********"
                autocomplete="off"
                required
              />
            </div>
  
            <button
              id="registerBtn"
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Register
            </button>
  
            <p class="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
              Already have an account? <a href="/login" class="text-blue-500 hover:underline">Login</a>
            </p>
          </form>
    `;
  
  }
  
}