#!/bin/sh
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
# usage: log "$RED" "ERROR" "message"
#log "$YELLOW" "INFO" "Démarrage du conteneur..."
#log "$GREEN" "SUCCESS" "Tout est bien configuré !"
#log "$RED" "ERROR" "Un problème est survenu !"
#log "$CYAN" "DEBUG" "Mode développement activé."



# Fonction d'initialisation du projet
# Créer le fichier src/index.ts
create_index_file() {
	cat << EOF > src/index.ts
import fastify from 'fastify'

const server = fastify()

server.get('/path_to_service/ping', async (request, reply) => {
  console.error("pong")
  return 'pong\n'
})
server.get('/path_to_service/index.html', async (request, reply) => {
  return 'index.html\n'
})

server.listen({host:"0.0.0.0", port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(\`Server listening at \${address}\`)
})
EOF
}

# Créer le fichier tsconfig.json
create_tsconfig_file() {
	cat << EOF > tsconfig.json
{
	"compilerOptions": {
		"target": "es2017",
		"module": "commonjs",                              /* Specify what module code is generated. */
		"baseUrl": "./",
		"outDir": "./build",
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"strict": true,
		"skipLibCheck": true ,                                /* Skip type checking all .d.ts files. */
		"paths": {
			"@src/*": ["src/*"]
			},
    "useUnknownInCatchVariables": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "build", "src/**/*.spec.ts","src/public/"]
}
EOF
}

# Créer le fichier nodemon.json
create_nodemon_file() {
  cat << EOF > nodemon.json
{
  "watch": ["/app/src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts","node_modules", "build"],
  "exec": "tsx /app/src/index.ts"
}
EOF
}

# Ajouter les scripts de démarrage dans package.json
populate_package_json() {
  sed -i '/"scripts": {/a \    "build": "tsc -p tsconfig.json",\n    "start": "node build/index.js",\n   "dev": "nodemon",\n' package.json
}

initialize_project() {
  # Vérifier si package.json existe, sinon initialiser le projet
  log "$YELLOW" "INFO" "Initialisation du projet Node.js avec npm init..."
    npm init -y
    npm install fastify typescript @types/node
    npm install -D tsx nodemon
    npm install  dotenv @types/dotenv

    npm install @fastify/swagger @fastify/swagger-ui # Swagger support for Fastify
    npm install zod @sinclair/typebox @fastify/type-provider-typebox # JSON schema validation

    # Créer le dossier build
    mkdir build
    # Créer le dossier src
    mkdir src
    # Créer les dossiers src/controllers, src/models, src/routes, src/services, src/utils, src/middlewares
    mkdir build src/controllers src/models src/routes src/services src/utils src/middlewares
    # Créer le fichier src/index.ts
    create_index_file
    # Créer le fichier tsconfig.json
    create_tsconfig_file
    # Créer le fichier nodemon.json
    create_nodemon_file
    # Ajouter les scripts de démarrage dans package.json
    populate_package_json
    # Afficher un message de succès
    log "$GREEN" "SUCCESS" "Initialisation du projet terminée avec succès !"
 
}

#npm and node version

log "$CYAN"  "DEBUG" "************************************"
log "$CYAN"  "DEBUG" "    npm version  : $(npm -v)"
log "$CYAN"  "DEBUG" "    node version : $(node -v)"
log "$CYAN"  "DEBUG" "************************************"


# Fonction pour installer les dépendances
install_dependencies() {

    log "$CYAN" "INFO" "Mode développement activé : installation des dépendances..."
    npm install
   
}

# Fonction principale qui va orchestrer l'ensemble du processus
main() {
  # Suppression du dossier node_modules
 # remove_node_modules

  # Initialisation du projet si nécessaire
 # initialize_project
  
  # Installation des dépendances
  #install_dependencies
    npm create vite@latest app --template vanilla-ts
  cd app
  npm install
  npm install lit
 # npm install @webcomponents/webcomponentsjs
  

}

# Appel de la fonction principale
main