import { RegisterData, registerUser } from '../services/authService.ts';
import { BaseComponent } from "../frameworks/base-component.ts";
import GlobalState, { UserContext } from "../globalstate/GlobalState.ts";
import { RouterConfig } from '../router/Router.ts';
type RegisterState = {
  name: string;
  email: string;
  password: string;
};

export class Register extends BaseComponent<{register:RegisterState,confirmPassword:string}> {
  constructor() {
    super({ register: { name:'', email: '', password: '' },confirmPassword:'' });
  }

/*   connectedCallback() {
    super.connectedCallback();
    this.render();
    
  } */

  setName(event: Event) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    console.log('setName:', input.value);
    this.setState({ register: { ...this.state.register, name: input.value } });
  }
  setEmail(event: Event) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    this.setState({ register: { ...this.state.register, email: input.value } });
  }  
  setPassword(event: Event) {
    const input = event.target as HTMLInputElement;
    this.setState({ register: { ...this.state.register, password: input.value } });
  }
  setconfirmPassword(event: Event) {
    const input = event.target as HTMLInputElement;
    this.setState({ confirmPassword: input.value });
  }
  handleSubmit = async(e: Event)=> {
    e.preventDefault()
    if (this.state.register.name === "" || this.state.register.email === "" || this.state.register.password === "") {
			alert("Please fill in all fields");
			return;
		}
    if (this.state.register.password !== this.state.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
    //  const globalState = GlobalState;
      const userContext = UserContext();
      const { setUser,user } = userContext;
			const registerData: RegisterData = { ...this.state.register };
			await  registerUser(registerData);
		//	const data = await fetchProfileData();
     // setUser(data);
      console.log('register successful:', user());
		/* 	setUser(user);
            //sendregisterMessage(); to WebSocket
            sendregisterMessage(user.id); */
			//Router.navigate('/profile');
         // Rediriger vers la page profile
    const router = RouterConfig.getInstance();
    router.navigate('/login');
		} catch (error) {
			console.error('register failed:', error);
			alert('register failed. Please try again.');
		}
  }

  render() {
      this.innerHTML = `
      <form id=formLogin class="form-container">
            <h2 class="text-3xl font-bold text-center mb-6">Register</h2> <label for="name" class="block  mb-2">Name:</label>
            <input
                id="name"
                type="text"
                value="${this.state.register.name}"
                class="form-text-input" placeholder="SuP€rK@RoT" required
            />
            <label for="email" class="block  mb-2">Email:</label>
            <input
                id="email"
                type="email"
                value="${this.state.register.email}"
                class="form-text-input" placeholder="name@student.42.fr" required
            />
            <label for="password" class="block  mb-2">Password:</label>
            <input
                id="password"
                type="password"
                value="${this.state.register.password}"
                class="form-text-input"
            />

           
            <label for="confirmPassword" class="block  mb-2">Confirm Password:</label>
            <input
                id="confirmPassword"
                type="password"
                value="${this.state.confirmPassword}"
                class="form-text-input"
            />
            <button
                id="loginBtn"
                type="submit"
                class="btn"
                >
                Login
            </button>
            <span class="text-sm text-center block mt-4">
                Already have account? <a href="/login" class="text-blue-500 hover:underline">Login</a>
            </span>
        </form>
    `;
    this.attachEvent(this, '#loginBtn', 'click', this.handleSubmit.bind(this));
    this.attachEvent(this, '#name', 'input', this.setName.bind(this));
    this.attachEvent(this, '#email', 'input', this.setEmail.bind(this));
    this.attachEvent(this, '#password', 'input', this.setPassword.bind(this));
    this.attachEvent(this, '#confirmPassword', 'input', this.setconfirmPassword.bind(this));
   // this.attachEvent(this.shadowRoot!, '#email', 'click', this.setEmail.bind(this));
    //this.attachEvent(this.shadowRoot!, '#password', 'click', this.setPassword.bind(this));
    //this.shadowRoot!.getElementById('incrementBtn')!.addEventListener('click', this.increment.bind(this));;
   // this.attachEvent(this.shadowRoot!, '#incrementBtn', 'click', this.increment.bind(this));
  
  } 
}