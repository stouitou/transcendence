FROM node:23-alpine

# Copier package.json et installer les dépendances en premier (pour utiliser le cache)
COPY ./app/package*.json ./
RUN apk add --no-cache xdg-utils
RUN mkdir /node_modules
RUN chown -R node:node /node_modules
RUN npm install -g npm@11.2.0


#RUN npm install

# Create and change to the app directory
WORKDIR /app

RUN chown -R node:node /app

# Copy the rest of the application code
EXPOSE 3000

# Copier le script d'entrée
COPY ./scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# Modifier les permissions AVANT de passer à node

RUN mkdir /app/node_modules
RUN chown -R node:node /app/node_modules
RUN cp -R /node_modules /app/node_modules


# Définir l'exécution par défaut
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]