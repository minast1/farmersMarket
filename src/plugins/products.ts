import Hapi from '@hapi/hapi'
import { Prisma } from '@prisma/client'
/*
 * TODO: We can't use this type because it is available only in 2.11.0 and previous versions
 * In 2.12.0, this will be namespaced under Prisma and can be used as Prisma.UserCreateInput
 * Once 2.12.0 is release, we can adjust this example.
 */
// import { UserCreateInput } from '@prisma/client'

// plugin to instantiate Prisma Client
const productsPlugin = {
  name: 'app/products',
  dependencies: ['prisma'],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'GET',
        path: '/',
            handler: getAllProductsHandler,
            options: {
              auth: {
              mode : 'try'
            } 
        }
        },
        
    ])
      
  },
}

export default productsPlugin

async function getAllProductsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app
  

  try {
    const products = await prisma.product.findMany();
    //console.log(request.auth.credentials)
    return  h.view('index', {products: products, session: request.auth.credentials})         //h.response(products).code(201)
  } catch (err) {
    console.log(err)
  }
}


