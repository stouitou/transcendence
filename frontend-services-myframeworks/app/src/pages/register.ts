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
      <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
          <form id="formLogin" class="space-y-5">
            <h2 class="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">Register</h2>
            
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name:</label>
              <input
                id="name"
                type="text"
                value="${this.state.register.name}"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SuP€rK@RoT"
                required
              />
            </div>
  
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email:</label>
              <input
                id="email"
                type="email"
                value="${this.state.register.email}"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="name@student.42.fr"
                required
              />
            </div>
  
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password:</label>
              <input
                id="password"
                type="password"
                value="${this.state.register.password}"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password:</label>
              <input
                id="confirmPassword"
                type="password"
                value="${this.state.confirmPassword}"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            <button
              id="loginBtn"
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Register
            </button>
  
            <p class="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
              Already have an account? <a href="/login" class="text-blue-500 hover:underline">Login</a>
            </p>
          </form>
        </div>
      </div>
    `;
  
    this.attachEvent(this, '#loginBtn', 'click', this.handleSubmit.bind(this));
    this.attachEvent(this, '#name', 'input', this.setName.bind(this));
    this.attachEvent(this, '#email', 'input', this.setEmail.bind(this));
    this.attachEvent(this, '#password', 'input', this.setPassword.bind(this));
    this.attachEvent(this, '#confirmPassword', 'input', this.setconfirmPassword.bind(this));
  }
  
}