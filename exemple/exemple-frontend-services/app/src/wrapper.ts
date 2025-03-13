//import 'lit_components/PongGame';
// customElements.define('pong-game', PongGame);
const pongGame = async () => {
	const script
		= document.createElement('script');
	script.type = 'module';
	script.src = 'https://localhost:4433/component-alias/src/pong-game.js';
	document.head.appendChild(script);
};
pongGame();
const UserProfile = async () => {
	//const data = await fetch('https://localhost:4433/component-alias/assets/remoteEntry.js');
	//console.log(data);
	const script
		= document.createElement('script');
	script.type = 'module';
	script.src = 'https://localhost:4433/component-alias/src/component/base.js';
	document.head.appendChild(script);
	/* script.text = await data.text();
	console.log(script.text);
	document.body.appendChild(script); */
};
UserProfile();