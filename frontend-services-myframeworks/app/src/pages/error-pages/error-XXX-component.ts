import { BaseComponent } from "../../frameworks/base-component";

//@TODO en cours
export class ErrorXXX extends BaseComponent {
	private errorCode: number = 404;
	private errorMessage: string = "Page Not Found";
	private errorDescription: string = "Sorry, the page you are looking for does not exist.";
	private errorMapping: { [key: number]: { message: string; description: string } } = {
		401: {
			message: "401 - Unauthorized",
			description: "Sorry, you are not authorized to access this page.",
		},
		403: {
			message: "403 - Forbidden",
			description: "Sorry, you do not have permission to access this page.",
		},
		404: {
			message: "404 - Page Not Found",
			description: "Sorry, the page you are looking for does not exist.",
		},
		500: {
			message: "500 - Internal Server Error",
			description: "Sorry, there was an error on the server.",
		},
		503: {
			message: "503 - Service Unavailable",
			description: "Sorry, the service is currently unavailable.",
		},
	};
	constructor() {
		super({});
	  }
	set data (data: any) {
		this.errorCode = data.errorCode || 404;
	}
	setErrorCode(code: number) {
		this.errorCode = code;
		if (this.errorMapping[code]) {
			this.errorMessage = this.errorMapping[code].message;
			this.errorDescription = this.errorMapping[code].description;
		} else {
			this.errorMessage = `${code} - Error`;
			this.errorDescription = "An unknown error occurred.";
		}
		this.render();
	}
	connectedCallback(): void {
		this.setErrorCode(this.errorCode);
	}

  
	render() {
		this.innerHTML = `
			<div class="min-h-screen w-full px-6 py-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
				<div class="max-w-7xl mx-auto space-y-10">					
					<h1 class="text-4xl font-bold text-center">${this.errorMessage}</h1>
					<p class="text-lg text-center">${this.errorDescription}</p>
					<div class="flex justify-center">
						<a href="/" class="btn">Go to Home</a>
					</div>
				</div>
			</div>
		`;
	  }
  }
  

  
  