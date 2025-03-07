#!/bin/sh

# Simple script to start the application
# It will install the dependencies and start the application
# It will also start the application in watch mode if the NODE_ENV is set to development

# Fonction pour afficher un message coloré
log() {
    local color_code=$1
    local label=$2
    shift 2 # Remove the first two arguments
    printf "\e[%sm[%s] %s\e[0m\n" "$color_code" "$label" "$*"
}


# Définition des couleurs
RED="31"
GREEN="32"
YELLOW="33"
BLUE="34"
CYAN="36"
WHITE="97"


echo "Starting entrypoint script"
log "$CYAN"  "DEBUG" "************************************"
log "$CYAN"  "DEBUG" "    npm version  : $(npm -v)"
log "$CYAN"  "DEBUG" "    node version : $(node -v)"
log "$CYAN"  "DEBUG" "************************************"
# Copy the node_modules folder to the app directory
log "$CYAN" "INFO" "Copie du dossier node_modules vers le répertoire de l'application..."
cp -R /node_modules /app

npm install -g typescript

  if [ "$NODE_ENV" = "development" ]; then
    # Start the application in watch mode
    log "$CYAN" "INFO" "Démarrage de l'application en mode développement avec nodemon..."
    # Start the application in watch mode
    exec npm run dev
    exec npm run build
  else
    log "$GREEN" "INFO" "Mode production activé : installation des dépendances de production..."
    # Install only production dependencies
    npm install --omit=dev
    # Install typescript
    # Build the application
    exec npm run build
    log "$GREEN" "INFO" "Démarrage de l'application en mode production..."
    # Start the application  
    exec npm start
  fi
