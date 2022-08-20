const config = require('./libs/config-loader');
const fconfig = config.get('fastify');
const boxen = require('boxen');

// Require the framework and instantiate it
const fastify = require('fastify')({ logger: fconfig.useLogger })

const PORT = config.get('PORT') || 3000;

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Run the server!
const start = async () => {
  try {

    console.log(boxen(`Starting server on port: ${PORT}`, {padding : 1}))
    await fastify.listen({ port: PORT })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()