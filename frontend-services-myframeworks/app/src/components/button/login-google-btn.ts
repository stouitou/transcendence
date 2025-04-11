import { loginWithProvider } from '../../services/authService.ts';
import { BaseComponent } from "../../frameworks/base-component.ts";

export class LoginGoogle extends BaseComponent {
  constructor() {
    super({});
  }

 handleSubmitGoogle = async (e: Event) => {
    e.preventDefault();
    console.log('handleSubmitGoogle');
try {
  await  loginWithProvider('google');
} catch (error) {
  console.error('Login failed:', error);
  alert('Login failed. Please try again.');
}
};

  render() {
      this.innerHTML = `
                <button id="loginBtnGoogle" type="submit" class="btn bg-red-500 hover:bg-red-600 ">
                    Login with Google
                </button>   
    `;
    this.attachEvent(this, '#loginBtnGoogle', 'click', this.handleSubmitGoogle.bind(this));
  } 
}