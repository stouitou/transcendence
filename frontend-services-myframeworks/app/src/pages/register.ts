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
    <div id="message-box" class="form-error"></div>

    !! - for display the error message for each field:
    <div id="name-error" class="form-error"></div>
    <input name="name" id="name" type="text" class="form-text-input" placeholder="SuP€rK@RoT" required />
  */

  render() {
    this.innerHTML = `
          <form id="formRegister" class="form-container">
            <h2 class="form-title">Register</h2>
             <div id="message-box" class="form-error"></div>
            
              <label for="name" class="form-label">Name:</label>
               <div id="name-error" class="form-error"></div>
              <input
                id="name"             
                type="text"
                name="name"
                class="form-text-input"
                placeholder="SuP€rK@RoT"
                autocomplete="name"
                required
              />
  
              <label for="email" class="form-label">Email:</label>
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
  
              <label for="password" class="form-label">Password:</label>
              <div id="password-error" class="form-error"></div>
              <input
                id="password"
                type="password"
                name="password"
                class="form-text-input"
                placeholder="********"
                autocomplete="off"
                required
              />
  
              <label for="confirmPassword" class="form-label">Confirm Password:</label>
              <div id="confirmPassword-error" class="form-error"></div>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                class="form-text-input"
                placeholder="********"
                autocomplete="off"
                required
              />
  
            <button
              id="registerBtn"
              type="submit"
              class="btn"
            >
              Register
            </button>
  
            <p class="form-footer">
              Already have an account? <a href="/login" class="form-footer-link">Login</a>
            </p>
          </form>
    `;
  
  }
  
}