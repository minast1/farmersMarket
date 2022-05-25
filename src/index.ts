import Hapi from '@hapi/hapi'
import prisma from './plugins/prisma'
//import users from './plugins/users'
import cookie from '@hapi/cookie';
import vision from '@hapi/vision';
import inert from '@hapi/inert';
import handlebars from 'handlebars';
import products from './plugins/products'
import auth from './plugins/auth'
import cart from './plugins/cart'
import path from 'path';
const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
});




export async function start(): Promise<Hapi.Server> {
 
  await server.register([prisma,cookie, auth, products, cart, vision,inert ]);
    
  server.views({
    engines: {
      html: handlebars
    },
    relativeTo: __dirname,
    path: 'views'
  });
  server.route({
    method: 'GET', 
    path: '/public/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, 'public')
      }
    }
  })
  await server.start()
  return server
}




process.on('unhandledRejection', async (err) => {
  await server.app.prisma.$disconnect()
  console.log(err)
  process.exit(1)
})

start()
  .then((server) => {
    console.log(`
🚀 Server ready at: ${server.info.uri}
⭐️ See sample requests: http://pris.ly/e/ts/rest-hapi#3-using-the-rest-api
`)
  })
  .catch((err) => {
    console.log(err)
  })
