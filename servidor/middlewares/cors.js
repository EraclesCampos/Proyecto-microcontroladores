// lista de origenes permitidos
const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost',
    'http://localhost:1234',
    'http://169.254.51.241:8080',
    'http://192.168.1.8:8080'
]

// configuracion personalizada del middleware de cors
export const corsOptions = {

    // funcion que valida el origen de la peticion
    
    // origin: (origin, callback) => {
    //     // Si no hay origen (ej: Postman o mismo dominio), permite el acceso
    //     if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
    //         callback(null, true) // Permitir el acceso
    //     } else {
    //         callback(new Error('No autorizado por CORS')) // Bloquea el acceso
    //     }
    // },

    origin: "*", // permitir todos los origenes
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // metodos permitidos
    allowedHeaders: ['Content-Type'], // encabezados permitidos
    credentials: true // permitir cookies y credenciales
}