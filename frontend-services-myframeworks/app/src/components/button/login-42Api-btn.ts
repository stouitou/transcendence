import { loginWithProvider } from '../../services/api.auth';
import { BaseComponent } from "../../frameworks/base-component";

export class Login42Api extends BaseComponent {
  constructor() {
    super({});
  }

 handleSubmit = async (e: Event) => {
    e.preventDefault();
    // console.log('handleSubmitGoogle');
try {
  await  loginWithProvider('42api');
} catch (error) {
  console.error('Login failed:', error);
  alert('Login failed. Please try again.');
}
};

  render() {
      this.innerHTML = `
                <button id="loginBtn42api" type="submit" class="btn bg-gray-700 hover:bg-gray-900">
                    Login with 42
                </button>  
    `;
    this.attachEvent(this, '#loginBtn42api', 'click', this.handleSubmit.bind(this));
  } 
}