import express from 'express'
import cors from 'cors'
import logger from 'morgan'
import {createServer} from 'node:http'
import fs from 'fs'
import { Client } from 'basic-ftp'

const PORT = 3000
const IP = '192.168.1.9' //sustituye por tu IP local
const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

const datos = []
const maxLectura = []

// variable para almacenar el ultima dia que se guardaron los datos en el archivo txt
// y se subieron al servidor ftp
let ultimoDiaEjecucion = null

// funcion para guardar la maxima lectura de cada zona en un array de objetos
const guardarMaximo = async (zona, decibelios, fecha) => {
    // comprobar si la zona ya existe en el array
    const maximo = maxLectura.find(item => item.zona === zona)
    if (maximo) {
        // si existe, comprobar si la nueva lectura es mayor que la anterior
        if (decibelios > maximo.decibelios) {
            // si es mayor, se actualiza la laectura
            maxLectura[maxLectura.indexOf(maximo)] = { zona, decibelios, fecha }
        }
    }
    // si no existe la zona en el array, se agrega un nuevo objeto con los datos 
    else {
        maxLectura.push({ zona, decibelios, fecha })
    }
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const hoy = ahora.getDate();

    // cuando la hora sean las 23:59 y el dia actual sea dierente del ultimo dia de ejecucion
    // se guardaran los datos en el archivo txt y se subira el archivo al servidor ftp
    if (horaActual === 23 && minutosActuales === 59 && ultimoDiaEjecucion !== hoy) {
        await guardarDatos(maxLectura);
        await subirArchivoFtp();
        maxLectura.length = 0;
        ultimoDiaEjecucion = hoy;
    }
}
// Funcion para guardar datos en un archivo txt
const guardarDatos = async (maxLectura)=>{
    // comprobar si el archivo ya existe
    if (fs.existsSync('datos.txt')) {
        // si existe, se elimina
        fs.unlinkSync('datos.txt')
    }
    // Si no existe, se crea uno nuevo y re guardan los datos
    // recorriendo el array de objetos de las mecturas maximas
    maxLectura.forEach((dato) => {
        // se destrucutra el objeto para obtener los valores del objeto que se esta recorriendo
        const { zona, decibelios, fecha } = dato
        // se crea un string con los datos de la lectura
        const texto = `Zona: ${zona}, Decibelios: ${decibelios}, Fecha: ${fecha}\n`
        // y se guarda en el archivo txt
        fs.appendFile('datos.txt', texto, (err) => {
            if (err) throw err
            console.log('Los datos se han guardado correctamente')
        })
    })
}

// funcion para subir el archivo al servidor ftp
const subirArchivoFtp = async () =>{
    // creamos el cliente ftp con la libreria basic-ftp
    const client = new Client()
    client.ftp.verbose = true
    // nos conectamos al servidor ftp con los datos de acceso
    try {
        await client.access({
            host: "192.168.1.28",
            user: "eracles",
            password: "2546",
            secure: false
        })
        console.log(await client.list())
        // y subimos el archivo
        await client.uploadFrom('./datos.txt', '/Escritorio/lecturas/datos.txt')
    }
    catch(err) {
        console.log(err)
    }
    client.close()

}

app.use(logger('dev'))

app.get('/', (req, res) => {
    // res.sendFile(process.cwd() + '/cliente/index.html')
    // res.sendFile(process.cwd() + '/cliente/index.js')
})

// Ruta para obtener los datos
app.get('/data',(req, res) => {
    res.json(datos)
})

// Ruta para enviar los datos a la API
app.post('/data', (req, res) => {
    // console.log('Datos recibidos: ', req.body);

    const nuevaLectura = { ...req.body, fecha: new Date().toISOString().replace('T', ' ').replace('Z', '') };
    const zonaExistenteIndex = datos.findIndex(item => item.zona === nuevaLectura.zona);

    if (zonaExistenteIndex !== -1) {
        datos[zonaExistenteIndex] = nuevaLectura;
    } else {
        datos.push(nuevaLectura);
    }
    // console.log('Zona: ', datos[0].zona + '\nDecibeles: ', datos[0].decibelios + '\nFecha: ', datos[0].fecha);
    guardarMaximo(nuevaLectura.zona, nuevaLectura.decibelios, nuevaLectura.fecha)
    res.json({ mensaje: 'Datos recibidos' });
})

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://${IP}:${PORT}`)
})