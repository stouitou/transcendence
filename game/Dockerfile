# Utiliser une image Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et installer les dépendances
COPY package.json package-lock.json ./

# Copier tout le projet
COPY ./src src
COPY index.html index.html

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD [ "entrypoint.sh" ]
