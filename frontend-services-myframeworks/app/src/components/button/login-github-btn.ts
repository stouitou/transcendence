import { loginWithProvider } from '../../services/authService.ts';
import { BaseComponent } from "../../frameworks/base-component.ts";

export class LoginGithub extends BaseComponent {
  constructor() {
    super({});
  }

 handleSubmit = async (e: Event) => {
    e.preventDefault();
    console.log('handleSubmitGoogle');
try {
  await  loginWithProvider('github');
} catch (error) {
  console.error('Login failed:', error);
  alert('Login failed. Please try again.');
}
};

  render() {
      this.innerHTML = `
                 <button id="loginBtnGithub" type="submit" class="btn bg-gray-800 hover:bg-gray-900">
                    Login with Github
                </button>  
    `;
    this.attachEvent(this, '#loginBtnGithub', 'click', this.handleSubmit.bind(this));
  } 
}