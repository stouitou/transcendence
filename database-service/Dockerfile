FROM node:23-alpine


RUN apk add --no-cache curl jq
# Copier package.json et installer les dépendances en premier (pour utiliser le cache)
COPY ./app/package*.json ./

# Create and change to the app directory
WORKDIR /app
RUN npm install -g npm@11.3.0
RUN npm install 

RUN chown -R node:node /app

# Copy the rest of the application code
EXPOSE 3000

# Copier le script d'entrée
COPY ./scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# copier les scripts helpers
# pour une manipulation des utilisateurs
COPY ./scripts/userUpdate.sh /usr/local/bin/userUpdate.sh
RUN chmod +x /usr/local/bin/userUpdate.sh

COPY ./scripts/userRole.sh /usr/local/bin/userRole.sh
RUN chmod +x /usr/local/bin/userRole.sh


# pour une manipulation plus generiques
COPY ./scripts/databaseGet.sh /usr/local/bin/databaseGet.sh
RUN chmod +x /usr/local/bin/databaseGet.sh

COPY ./scripts/databaseUpdate.sh /usr/local/bin/databaseUpdate.sh
RUN chmod +x /usr/local/bin/databaseUpdate.sh

COPY ./scripts/databaseDelete.sh /usr/local/bin/databaseDelete.sh
RUN chmod +x /usr/local/bin/databaseDelete.sh

# Modifier les permissions AVANT de passer à node

RUN mkdir /app/node_modules
RUN chown -R node:node /app/node_modules
RUN cp -R /node_modules /app/node_modules

RUN mkdir /data
RUN chown -R node:node /data


# Définir l'exécution par défaut
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
