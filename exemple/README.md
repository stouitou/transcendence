## Exemple de 2 container communicant via vite/lit en Typescript

### integrations des webcomponent
http://localhost:5174/ 
- port par default de vite : 5174
```sh
cd exemple/exemple-webcomponent/app
npm install
npm run build
npm run dev #watch mode
```
### composant pong-game.js
http://localhost:5555/
- modification du port dans le fichier de config de vite: 
  'exemple/exemple-external-container/app/vite.config.js'
```sh
cd exemple/exemple-external-container/app
npm install
npm run build
npm run dev
```
 le composant pong-game.js est a l'url: http://localhost:5555/src/pong-game.js