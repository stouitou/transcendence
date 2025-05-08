import { loginUser,LoginData, fetchProfileData } from '../services/authService';
import { BaseComponent } from "../frameworks/base-component";
import GlobalState, { UserContext } from "../globalstate/GlobalState";
import { RouterConfig } from '../router/Router';
import { LoginProvider } from '../components/login-provider-component';
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
      const userContext = UserContext();
      const { setUser,user } = userContext;
			const loginData: LoginData = { ...this.state.login };
			await  loginUser(loginData);
			const data = await fetchProfileData();
      UserContext().setUser(data);
      UserContext().setLoginSuccess();

      console.log('Login successful:', user());
      const router = RouterConfig.getInstance();
      router.navigate('/');
		} catch (error) {
			console.error('Login failed:', error);
			alert('Login failed. Please try again.');
		}
  }

  render() {
      this.innerHTML = `
      <form id=formLogin class="form-container">
            <h2 class="text-3xl font-bold text-center mb-6">Login</h2>
            <label for="email" class="block  mb-2">Email:</label>
            <input
                id="email"
                type="email"
                value="${this.state.login.email}"
                class="form-text-input" placeholder="name@student.42.fr" required
            />
            <label for="password" class="block  mb-2">Password:</label>
            <input
                id="password"
                type="password"
                value="${this.state.login.password}"
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
                Don't have an account? <a href="/register" class="text-blue-500 hover:underline">Register</a>
            </span>
        </form>
        <login-provider-component />
    `;
    this.attachEvent(this, '#loginBtn', 'click', this.handleSubmit.bind(this));
    this.attachEvent(this, '#email', 'input', this.setEmail.bind(this));
    this.attachEvent(this, '#password', 'input', this.setPassword.bind(this));  
  } 
}