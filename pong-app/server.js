const fastify = require('fastify')({ logger: true });
const path = require('path');

// Servir les fichiers statiques du dossier frontend
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'frontend'),
    prefix: '/', 
});

// Route principale
fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
});

// Démarrer le serveur
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log("🚀 Serveur lancé sur http://localhost:3000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
