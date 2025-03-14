import express from 'express'
import cors from 'cors'
import logger from 'morgan'
import {createServer} from 'node:http'

const PORT = 3000
const IP = '192.168.1.13' //sustituye por tu IP local

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

const datos = []

app.use(logger('dev'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/cliente/index.html')
})

app.get('/data',(req, res) => {
    res.json(datos)
})

app.post('/data', (req, res) => {
    console.log('Datos recibidos: ', req.body);

    const nuevaLectura = { ...req.body, fecha: new Date().toISOString().replace('T', ' ').replace('Z', '') };
    const zonaExistenteIndex = datos.findIndex(item => item.zona === nuevaLectura.zona);

    if (zonaExistenteIndex !== -1) {
        datos[zonaExistenteIndex] = nuevaLectura;
    } else {
        datos.push(nuevaLectura);
    }
    console.log('Zona: ', datos[0].zona + '\nDecibeles: ', datos[0].decibelios + '\nFecha: ', datos[0].fecha);
})

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://${IP}:${PORT}`)
})