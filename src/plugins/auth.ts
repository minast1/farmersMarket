import Hapi from '@hapi/hapi'
import { Prisma } from '@prisma/client'
import Joi from 'joi';
import Bcrypt from 'bcrypt';



const authPlugin = {
    name: 'app/auth',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        server.auth.strategy('session', 'cookie', {
            cookie: {
                name: 'hapi_session',
                password: '$5$pOBYd8Nu4o4BTUs5$//YDdoHS8L29cRKFTwteFQCsIJftY2tqPF6SnP517V1',
                isSecure: false,
                ttl: 24*60*60*1000
            },
            redirectTo: '/',
            validateFunc: async (request: Hapi.Request, session: any) => {
                const { prisma } = request.server.app;
                const user = await prisma.user.findFirst({
                    where: {
                        id: session.id
                    },
                    select: {
                        id: true,
                        email : true ,
                        name: true 
                    }
                });
                if (!user) {
                    return {valid : false }
                }
                return {valid: true , credentials: user}
            }
        });
           server.auth.default('session');
        server.route([
            {
                method: 'GET',
                path: '/login',
                handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                
                    return h.view('login')
                },
                options: {
                    auth: false,
                
                }
            },

            {
                method: 'POST',
                path: '/login',
                handler: loginHandler,
                options: {
                
                    auth: {
                        mode: 'try'
                    },
                    validate: {
                        options: {
                            abortEarly: false
                        },
                        payload: Joi.object({
                            email: Joi.string().email().trim(true).required(),
                            password: Joi.string().min(8).required()
                        }),
                        failAction: (request: Hapi.Request, h: Hapi.ResponseToolkit, err:any) => {
                         
                            const errors:any = {};
                            const details:any  = err.details; 
                            for (let index = 0; index < details.length; index++) {
                                if (!errors.hasOwnProperty(details[index].path)) {
                                    errors[details[index].path] = details[index].message
                                }
                                
                            }
                    
                        return h.view('login', { errors: errors}).takeover()
                    }
                    
                },
                
                
            }
            },
        
        {
            method: 'GET',
            path: '/register',
            handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                return h.view('register')
            },
            options: {
                auth: false,
                
            }
            },
            {
                method: 'GET',
                path: '/logout',
                handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                    request.cookieAuth.clear();
                    return h.redirect('/')
                }
            },
        {
            method: 'POST',
            path: '/register',
            handler: registerHandler,
            options: {
                auth: {
                        mode: 'optional'
                    },
                 validate: {
                        options: {
                            abortEarly: false
                        },
                     payload: Joi.object({
                            name: Joi.string().required(),
                            email: Joi.string().email().trim(true).required(),
                         password: Joi.string().min(8).required(),
                         confirmation: Joi.any().valid(Joi.ref('password'))

                        }),
                        failAction: (request: Hapi.Request, h: Hapi.ResponseToolkit, err:any) => {
                         
                            const errors:any = {};
                            const details:any  = err.details; 
                            for (let index = 0; index < details.length; index++) {
                                if (!errors.hasOwnProperty(details[index].path)) {
                                    errors[details[index].path] = details[index].message
                                }
                                
                            }
                    
                        return h.view('register', { errors: errors}).takeover()
                    }
                    
                },
            },
            
        }
        
    ])
      
  },
}

export default authPlugin

const loginHandler =async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
     const { email, password } = request.payload as any 
                     const { prisma } = request.server.app
                   // console.log(request.payload)
                    const user = await prisma.user.findFirst({
                        where: {
                            email: email
                        }
                    });
                    if (!user) {
                        return h.view('login', {valError: 'Invalid User Credentials'})
                    }
                    if (user) {
                       
                        let passwordChech = await Bcrypt.compare(password, user.password);
                        if (passwordChech) {
                            const sessionInfo = { id: user.id, name: user.name, email: user.email };
                            request.cookieAuth.set(sessionInfo)
                            return h.redirect('/')
                        } else {
                             return h.view('login', {valError: 'Password is Invalid..!'})
                        }
                       
                    }
}

const registerHandler =async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
     const { email, password, name } = request.payload as any 
                const { prisma } = request.server.app;
                const salt = Bcrypt.genSaltSync(10);
                const hash = Bcrypt.hashSync(password, salt);
    try {
        const verifyIfEmailExists = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
        if (verifyIfEmailExists) {
            return h.view('register', {valError: 'Email Exists..!'})
        }
                     const newUser = await prisma.user.create({
                    data: {
                        email: email,
                        name: name,
                        password: hash 
                    },
                    select: {
                        id: true,
                        name: true, 
                        email:true 
                    }
               })
                const sessionInfo = { id: newUser.id, name: newUser.name, email: newUser.email };
                   request.cookieAuth.set(sessionInfo);
                     return h.redirect('/')
                   
                } catch (error) {
                    console.log(error)
                }
}