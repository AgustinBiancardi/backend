import { createServer } from 'http'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import express from 'express'
import { faker } from '@faker-js/faker';
faker.locale = 'es';
import mongooose from 'mongoose';
import * as models from './models/mensajes.js';
import {normalize, denormalize, schema} from 'normalizr'
import util from 'util'

const app = express()
app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'handlebars')

const httpServer = new createServer(app)
const io = new Server(httpServer)

connectToMongo()
async function connectToMongo() {
    try {
        const URL = "mongodb+srv://agustinbiancardi:river2002@cluster1.9xgod.mongodb.net/?retryWrites=true&w=majority"
        let conexion = await mongooose.connect(URL);
        console.log("Conexion a Mongo exitosa");
        return
    } catch (error) {
        console.log(error);
    }
}

let productos

function crearProducto(id) {
    return {
        id: id,
        nombre: faker.commerce.product(),
        precio: faker.commerce.price(),
        foto: faker.image.animals()
    }
}

app.get('/', (req, res) => {
    productos = Array.from(new Array(5), (v, i) => crearProducto(i + 1))
    res.render('productos', null)
})


io.on('connection', async (socket) => {
    console.log('Un cliente se ha conectado!')
    let mensajes = await models.mensajes.findById("62b290452493b3ca492d2078");
    const normalizeMensajes = normalizar(mensajes.mensajes)
    console.log('Porcentaje de compresion: ' + (100 - (JSON.stringify(normalizeMensajes).length * 100 / JSON.stringify(mensajes.mensajes).length)) + '%')
    socket.emit('messages', normalizeMensajes,mensajes.mensajes)

    socket.emit('productos', productos)

    socket.on('new-message', async data => {
        let mensajes = await models.mensajes.findById("62b290452493b3ca492d2078");
        let newMensajes = [...mensajes.mensajes , data]
        await models.mensajes.findByIdAndUpdate("62b290452493b3ca492d2078", {mensajes: newMensajes});
        io.sockets.emit('messages', newMensajes)
    })
})

function normalizar(mensajes){
    const author = new schema.Entity('author',{

    });
    const text = new schema.Entity('text');
    const mensaje = new schema.Entity('mensaje', {
        author: author,
        text: text
    });
    function print(objeto) {
        console.log(util.inspect(objeto, false, 12, true))
    }
    const normalizechat = normalize(mensajes, [mensaje])
    
    console.log('Longitud del objeto orginal: ' + JSON.stringify(mensajes).length)
    console.log('Longitud del objeto normalizado: ' + JSON.stringify(normalizechat).length)
    return normalizechat
}

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, () => console.log('Iniciando en el puerto: ' + PORT))
