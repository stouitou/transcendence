import { BaseComponent } from "../../frameworks/base-component";

export class Error404 extends BaseComponent {
	constructor() {
		super({});
	  }
  
	render() {
		this.innerHTML = `
		  <div class="min-h-screen w-full px-6 py-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
			<div class="max-w-7xl mx-auto space-y-10">
			  
			  <h1 class="text-4xl font-bold text-center">404 - Page Not Found</h1>
			  <p class="text-lg text-center">Sorry, the page you are looking for does not exist.</p>
			  <div class="flex justify-center">
				<a href="/" class="btn">Go to Home</a>
			</div>
		  </div>
		`;
	  }
  }
  
  