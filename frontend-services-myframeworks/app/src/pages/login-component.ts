import { loginUser,LoginData, fetchProfileData } from '../services/authService.ts';
import { BaseComponent } from "../frameworks/base-component.ts";
import GlobalState, { UserContext } from "../globalstate/GlobalState.ts";
import { RouterConfig } from '../router/Router.ts';
import { LoginProvider } from '../components/login-provider-component.ts';
type LoginState = {
  email: string;
  password: string;
};
if (!customElements.get('login-provider-component'))
customElements.define('login-provider-component', LoginProvider);
export class Login extends BaseComponent<{login:LoginState}> {
  constructor() {
    super({ login: { email: '', password: '' } });
  }

/*   connectedCallback() {
    super.connectedCallback();
    this.render();
    
  } */

  setEmail(event: Event) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    this.setState({ login: { ...this.state.login, email: input.value } });
  }  
  setPassword(event: Event) {
    const input = event.target as HTMLInputElement;
    this.setState({ login: { ...this.state.login, password: input.value } });
  }
  handleSubmit = async(e: Event)=> {
    e.preventDefault()
    if (this.state.login.email === "" || this.state.login.password === "") {
			alert("Please fill in all fields");
			return;
		}
    try {
    //  const globalState = GlobalState;
      const userContext = UserContext();
      const { setUser,user } = userContext;
			const loginData: LoginData = { ...this.state.login };
			await  loginUser(loginData);
			const data = await fetchProfileData();
      UserContext().setUser(data);
      UserContext().setLoginSuccess();

      console.log('Login successful:', user());
      const router = RouterConfig.getInstance();
      router.navigate('/profile');
		} catch (error) {
			console.error('Login failed:', error);
			alert('Login failed. Please try again.');
		}
  }

  render() {
    this.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
          <form id="formLogin" class="space-y-6">
            <h2 class="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">Login</h2>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email:</label>
              <input
                id="email"
                type="email"
                value="${this.state.login.email}"
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
                value="${this.state.login.password}"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              id="loginBtn"
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Login
            </button>
            
            <p class="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
              Don't have an account?
              <a href="/register" class="text-blue-500 hover:underline">Register</a>
            </p>
          </form>
          
          <div class="mt-6">
            <login-provider-component />
          </div>
        </div>
      </div>
    `;
  
    this.attachEvent(this, '#loginBtn', 'click', this.handleSubmit.bind(this));
    this.attachEvent(this, '#email', 'input', this.setEmail.bind(this));
    this.attachEvent(this, '#password', 'input', this.setPassword.bind(this));
  }
  
}

