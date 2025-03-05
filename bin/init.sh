#!/bin/bash
echo 'script init.sh create package.json'

echo 'npm version'
npm -v
echo 'node version'
node -v


FILE=package.json

# if file exists, exit
if [ -f "$FILE" ]; then
	echo "$FILE exists."
	exit 1
fi


if [ ! -f "$FILE" ]; then
	echo 'npm init -y'
	touch .env
	npm init -y
	npm install fastify typescript @types/node 
    npm install -D tsx nodemon
	
	echo 'build folder'
	mkdir build
	mkdir src
	mkdir src/controllers
	mkdir src/models
	mkdir src/routes
	mkdir src/services
	mkdir src/utils
	mkdir src/middlewares
# Create a src/index.ts file with the following content:
	cat << EOF > src/index.ts
import fastify from 'fastify'

const server = fastify()

server.get('/ping', async (request, reply) => {
  console.error("pong")
  return 'pong\n'
})

server.listen({host:"0.0.0.0", port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(\`Server listening at \${address}\`)
})
EOF
# Create a tsconfig.json file in the root of the project with the following content:
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

#create nodemon.json
cat << EOF > nodemon.json
{
  "watch": ["/app/src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts","node_modules", "build"],
  "exec": "tsx /app/src/index.ts"
}
EOF
fi

if [  -f "$FILE" ]; then
	echo "package.json ok"
else
	echo "no package.json"
fi

# Add the following lines to the "scripts" section of the package.json
#"build": "tsc -p tsconfig.json",\n    "start": "node index.js"

if [ -f "$FILE" ]; then
    echo "package.json ok"
    # Add the following lines to the "scripts" section of the package.json
    sed -i '/"scripts": {/a \    "build": "tsc -p tsconfig.json",\n    "start": "node build/index.js",\n   "dev": "nodemon",\n' package.json
else
    echo "no package.json"
fi

echo 'npm run build'
npm run build
#echo 'npm run dev'
#npm run dev

