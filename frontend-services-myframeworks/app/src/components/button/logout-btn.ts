import { logoutUser } from '../../services/authService';
import { BaseComponent } from "../../frameworks/base-component";
import { UserContext } from '../../globalstate/GlobalState';

export class Logout extends BaseComponent {
  constructor() {
    super({});
  }

  handleSubmitLogout = async (e: Event) => {
    e.preventDefault();
    console.log('btn handleSubmitLogout');
try {
  await  logoutUser(); 
  UserContext().setUserLogout();

} catch (error) {
  console.error('logoutUser failed:', error);
  alert('Login failed. Please try again.');
}
};

  render() {
      this.innerHTML = `
                <button id="logoutBtn" type="submit" class="btn bg-red-400 hover:bg-red-600">
                    Logout
                </button>   
    `;
    this.attachEvent(this, '#logoutBtn', 'click', this.handleSubmitLogout.bind(this));
    
  } 
}