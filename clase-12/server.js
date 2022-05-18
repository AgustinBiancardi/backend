const express = require('express')
const handlebars = require('express-handlebars')
const fs = require("fs")
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()

app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'handlebars')

const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

let messages = []
let productos = []
let obj

class Contenedor {
    constructor(path) {
        this.path = path
    }

    async getAll() {
        try {
            const prods = await fs.promises.readFile(this.path, "utf-8")
            let obj = JSON.parse(prods)

            return obj

        } catch (error) {
            return ("No se pudo leer el archivo " + error)
        }
    }

    async save(producto){
        try {
            const prods = await fs.promises.readFile(this.path, "utf-8")
            let obj = JSON.parse(prods)
            obj.push(producto) 

            try {
                await fs.promises.writeFile(this.path,JSON.stringify(obj,null,2))
            } catch (error) {
                console.log("No se pudo guardar su producto: " + error)
                throw new Error(error)
            }

        } catch (error) {
            console.log("No se pudo leer el archivo " + error)
            throw new Error(error)
        }
    }

}

async function buscar(catalogo) {
    productos = await catalogo.getAll()
}

async function buscarmensajes(mensajes) {
    messages = await mensajes.getAll()
}

app.get('/', (req, res) => {
    res.render('productos', null)
})

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado!')
    let catalogo = new Contenedor("./productos.txt")
    let chat = new Contenedor("./mensajes.txt")
    buscar(catalogo)
    buscarmensajes(chat)
    socket.emit('messages', messages)
    socket.emit('productos', productos)

    socket.on('new-message', data => {
        messages.push(data)
        let mensajes = new Contenedor("./mensajes.txt")
        mensajes.save(data)
        io.sockets.emit('messages', messages)
    })

    socket.on('new-producto', data => {
        productos.push(data)
        let catalogo = new Contenedor("./productos.txt")
        catalogo.save(data)
        io.sockets.emit('productos', productos)
    })
})

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, () => console.log('Iniciando en el puerto: ' + PORT))