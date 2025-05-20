import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import {User} from '../types/types';

 type DonutSegment = {
	label: string;
	value: number;
	color: string;
  }; 
  type DonutsType ={
	dataset: DonutSegment[];
	title: string;
	legende: {label: string, color: string }[];
};
/* example of data
 const data: DonutSegment[] = [
	 { label: "Red", value: 30, color: "#f87171" }, // Rouge
	{ label: "Blue", value: 40, color: "#60a5fa" }, // Bleu
	{ label: "Green", value: 20, color: "#34d399" }, // Vert
	{ label: "Yellow", value: 10, color: "#fbbf24" }, // Jaune
	{ label: "lose", value: 10, color: "#f87171" }, // Rouge
	{ label: "win", value: 90, color: "#60a5fa" }, // Bleu
  ]; */
  


  export class DonutsChart extends BaseComponent<{ user: User | null}> {
	  private dataChart: DonutsType;
	  private svg: SVGSVGElement | null = null;
		private label: HTMLElement | null = null;
		private total: number = 0;
	constructor() {
		super({ user: null});
		this.dataChart = {
		  dataset: [],
		  title: '',
		  legende: []
		};
	  }
	  set data(data: DonutsType) {
		  this.dataChart = data;
		  this.render();
		}
	
	connectedCallback() {
	super.connectedCallback();
	this.state.user = UserContext().user();

	this.render();
	document.addEventListener('profile-data-updated', (e: Event) => {
	  const customEvent = e as CustomEvent;
	  console.log('profile-data-updated event received');
	  this.state.user = customEvent.detail.profileData;
	  this.render();
	});
	}
	
	render() {
	  this.renderDashboard();
	}
	
	private renderDashboard() {
	  this.innerHTML = `
	  
		<div class="max-w-sm mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
  <h2 class="chart-title text-xl font-bold text-center mb-4 text-gray-800 dark:text-white">${this.dataChart.title}</h2>
  <div class="relative w-64 h-64">
    <svg class="w-full h-full" viewBox="0 0 36 36">
      <!-- Les segments du donut seront ajoutés ici dynamiquement -->
    </svg>
  </div>
  <div class="mt-4 text-center">
	<span class="text-sm text-gray-600 dark:text-gray-400">légende :</span>
	<div class="flex justify-center mt-2">
	${this.dataChart.legende.map((item) => `
	  <div class="flex items-center mr-4">
		<div class="w-4 h-4 ${item.color} rounded-full mr-2"></div>
		<span class="text-sm text-gray-800 dark:text-white">${item.label}</span>
	  </div>`).join('')}

	<div>
      <span  class="donutLabel text-xl font-bold text-gray-800 dark:text-white"></span>
    </div>
</div>
	  `;

	  this.createDonutChart();
	}

	createDonutChart() {
		this.svg = this.querySelector('svg') as SVGSVGElement;
		this.label = this.querySelector(".donutLabel") as HTMLElement;
		this.total = this.dataChart.dataset.reduce((sum, segment) => sum + segment.value, 0);
		this.renderCharts();
	  }
	  
	
	private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
		const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
		return {
		  x: centerX + radius * Math.cos(angleInRadians),
		  y: centerY + radius * Math.sin(angleInRadians),
		};
	  }
	
	  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
		const start = this.polarToCartesian(x, y, radius, endAngle);
		const end = this.polarToCartesian(x, y, radius, startAngle);
	
		const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	
		return [
		  `M ${start.x} ${start.y}`,
		  `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
		  `L ${x} ${y}`,
		  `Z`,
		].join(" ");
	  }

	  private renderCharts() {
		let startAngle = 0;
	
		this.dataChart.dataset.forEach((segment) => {
			    // Vérifier si le segment représente 100%
				if (segment.value === this.total) {
					const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					circle.setAttribute("cx", "18");
					circle.setAttribute("cy", "18");
					circle.setAttribute("r", "15");
					circle.setAttribute("fill", segment.color);

					circle.setAttribute("data-label", segment.label);
					circle.setAttribute("data-value", segment.value.toString());
					circle.setAttribute("data-color", segment.color);
					this.attachEventOnSvg(circle);
					if (!this.svg) {
						console.error("SVG element not found");
						return;
					}
					this.svg.appendChild(circle);
					return; // Pas besoin de continuer pour ce segment
				  }
		  const endAngle = startAngle + (segment.value / this.total) * 360;
	
		  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		  path.setAttribute("d", this.describeArc(18, 18, 15, startAngle, endAngle));
		  path.setAttribute("fill", segment.color);
		  //add on mouseover event on title
		  path.setAttribute("data-label", segment.label);
		  path.setAttribute("data-value", segment.value.toString());
		  path.setAttribute("data-color", segment.color);
		  this.attachEventOnSvg(path);
		  if (!this.svg) {
			console.error("SVG element not found");
			return;
		  }
		  this.svg.appendChild(path);
	
		  startAngle = endAngle;
		});
	  }


	attachEventOnSvg(path: SVGPathElement) {
		this.attachEventOnHtmlElement(path, "mouseover", this.handleMouseOver.bind(this) as EventListener);
		this.attachEventOnHtmlElement(path, "mouseout", this.handleMouseout.bind(this) as EventListener);
	}
	handleMouseOver(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const label = target.getAttribute("data-label");
		const value = target.getAttribute("data-value");
		const color = target.getAttribute("data-color");
		if (!this.label) {
			console.error("Label element not found");
			return;
		}
	  
		this.label.textContent = `${label}: ${value}`;
		this.label.style.color = color || "#000";
		this.label.style.backgroundColor = "#fff";
		this.label.style.borderRadius = "5px";
		this.label.style.padding = "5px";
		this.label.style.position = "absolute";
		this.label.style.zIndex = "10";
		this.label.style.pointerEvents = "none";
	  
		// Positionner le label en fonction de la souris
		const offsetX = 10; // Décalage horizontal
		const offsetY = 10; // Décalage vertical
		const mouseX = e.pageX;
		const mouseY = e.pageY;
	  
		// Vérifier les limites de la fenêtre
		const labelWidth = this.label.offsetWidth;
		const labelHeight = this.label.offsetHeight;
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
	  
		let posX = mouseX + offsetX;
		let posY = mouseY + offsetY;
	  
		// Ajuster si le label dépasse à droite
		if (posX + labelWidth > windowWidth) {
		  posX = mouseX - labelWidth - offsetX;
		}
	  
		// Ajuster si le label dépasse en bas
		if (posY + labelHeight > windowHeight) {
		  posY = mouseY - labelHeight - offsetY;
		}
	  
		this.label.style.left = `${posX}px`;
		this.label.style.top = `${posY}px`;
	  }
	  

	  handleMouseout(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		if (!this.label) {
			console.error("Label element not found");
			return;
		}
		this.label.textContent = ``;
		this.label.style.backgroundColor = "transparent";
		this.label.style.borderRadius = "0px";
		this.label.style.padding = "0px";
		this.label.style.position = "static";
		this.label.style.zIndex = "0";
		this.label.style.pointerEvents = "none";
		this.label.style.transform = `translate(0, 0)`;
	  }
}