import Hapi from '@hapi/hapi'
import { Prisma } from '@prisma/client'
/*
 * TODO: We can't use this type because it is available only in 2.11.0 and previous versions
 * In 2.12.0, this will be namespaced under Prisma and can be used as Prisma.UserCreateInput
 * Once 2.12.0 is release, we can adjust this example.
 */
// import { UserCreateInput } from '@prisma/client'

// plugin to instantiate Prisma Client
const cartPlugin = {
  name: 'app/cart',
  dependencies: ['prisma'],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'GET',
        path: '/cart',
        handler: cartHandler,
        options: {
              auth: {
              mode : 'try'
            } 
        }
      },
    ])
      
  }
}

export default cartPlugin

async function cartHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
 
    return h.view('cart')
  
}

