import { loginUser,LoginData, fetchProfileData } from '../services/authService';
import { BaseComponent } from "../frameworks/base-component";
import GlobalState, { UserContext } from "../globalstate/GlobalState";
import { RouterConfig } from '../router/Router';
import { LoginProvider } from '../components/login-provider-component';
import { verify2FA } from '../services/api.2fa';
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
  handleVerify2FACode = async(e: Event)=> {
    e.preventDefault()
    const inputs = document.querySelectorAll<HTMLInputElement>(".code-input");
    const code = Array.from(inputs).map((input) => input.value).join("");

  if (code.length !== 6) {
    alert("Please fill in all fields");
    return;
  }
    try {
     const data2FA = await verify2FA(code);
     if (!data2FA) {
        return;
      }
      console.log('2FA verification successful:');
      const data = await fetchProfileData();
      if (!data) {
        return;
      }
      UserContext().setUser(data);
      UserContext().setLoginSuccess(data2FA.token);
      const router = RouterConfig.getInstance();
      router.navigate('/');
    } catch (error) {
      console.error('2FA verification failed:', error);
      alert('2FA verification failed. Please try again.');
    }
  }
  handleSubmit = async(e: Event)=> {
    e.preventDefault()
    if (this.state.login.email === "" || this.state.login.password === "") {
			alert("Please fill in all fields");
			return;
		}
    if (this.state.login.password.length < 8) {
      alert("password must be at least 8 characters long");
      return;
    }
    try {
			const loginData: LoginData = { ...this.state.login };
			const loginToken = await  loginUser(loginData);
      const { twoFactorRequired} = loginToken;
      console.log('Login 2FA token:', loginToken);
      if (twoFactorRequired) {
        console.log('Two-factor authentication required');
      this.innerHTML = `
      <style>
  .qr-code-container {
    text-align: center;
    margin-top: 20px;
  }
  .qr-code-image {
    max-width: 200px;
    margin: 0 auto;
    display: block;
  }
    .code-input-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.code-input {
  width: 40px;
  height: 40px;
  text-align: center;
  font-size: 18px;
  border: 2px solid green;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
}

.code-input:focus {
  border-color: darkgreen;
  box-shadow: 0 0 5px rgba(0, 128, 0, 0.5);
}
</style>
        <div class="qr-code-container">
          <h2 class="text-2xl font-bold text-center mb-4">Scan this QR Code</h2>
       <!--   <img 
          referrerpolicy="no-referrer"
          src="/api/auth/2fa/qrcode" alt="QR Code for 2FA" class="qr-code-image" />-->
          <p class="text-center mt-4">enter the code below:</p>
          <!--<input
            id="2faCode"
            type="text"
            class="form-text-input"
            placeholder="Enter the code"
            required
          />-->
          <div id="2faCodeContainer" class="code-input-container">
            <input type="text" maxlength="1" class="form-text-input code-input" />
            <input type="text" maxlength="1" class="form-text-input code-input" />
            <input type="text" maxlength="1" class="form-text-input code-input" />
            <input type="text" maxlength="1" class="form-text-input code-input" />
            <input type="text" maxlength="1" class="form-text-input code-input" />
            <input type="text" maxlength="1" class="form-text-input code-input" />
          </div>
          <button
            id="verify2faBtn"
            type="submit"
            class="btn mt-4"
            >
            Verify 2FA Code
          </button>
        </div>
      `;
      this.attachEvent(this, '#verify2faBtn', 'click', this.handleVerify2FACode.bind(this));
        // Initialiser la navigation automatique entre les champs
        this.handle2FAInput();
        return;
      }
			const data = await fetchProfileData();
      UserContext().setUser(data);
      UserContext().setLoginSuccess(loginToken.token);

      console.log('Login successful');
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

  handle2FAInput = () => {
        const inputs = document.querySelectorAll<HTMLInputElement>(".code-input");

        inputs.forEach((input, index) => {
          input.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.value.length === 1 && index < inputs.length - 1) {
              inputs[index + 1].focus(); // Passer au champ suivant
            }
          });

          input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) {
              inputs[index - 1].focus(); // Revenir au champ précédent
            }
          });
        });
      };
}