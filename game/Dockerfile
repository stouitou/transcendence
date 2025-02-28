# Utiliser une image Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et installer les dépendances
COPY package.json package-lock.json ./
RUN npm install
RUN npm install --save-dev typescript

# Copier tout le projet
COPY . .

# Compiler TypeScript en JavaScript
RUN npm run build

ENV PATH="./node_modules/.bin:$PATH"

# Exposer le port par défaut de Vite
EXPOSE 5173

# Commande pour démarrer l'application
CMD ["npm", "run", "dev", "--", "--host"]
