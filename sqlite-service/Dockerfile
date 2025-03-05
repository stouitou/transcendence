FROM node:23-alpine

# Copier package.json et installer les dépendances en premier (pour utiliser le cache)
COPY ./app/package*.json ./

#RUN npm install npm@11.1.0 --only=production
# Add this line to your Dockerfile before running npm install

RUN npm install

# Create and change to the app directory
WORKDIR /app
RUN chown -R node:node /app
# Copy the rest of the application code
EXPOSE 3000

# Copier le script d'entrée
COPY ./scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN mkdir /data
RUN chown -R node:node /data
#COPY --chown=node:node ./app/src/data /data


# Modifier les permissions AVANT de passer à node
USER node

# Définir l'exécution par défaut
#ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# Command to run the application
CMD ["npm", "run", "dev"]
#CMD ["node", "dist/app.js"]