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
  console.log(`Server listening at ${address}`)
})
