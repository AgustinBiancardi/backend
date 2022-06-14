import { createServer } from 'http'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import { options } from './options/mysqlconfig.js'
import { optionsqlite } from './options/sqlite.js'
import SQL from './sql.js'
import express from 'express'

const sqlProd = new SQL(options)
const sqlMens = new SQL(optionsqlite)
async function createTables (){
    await sqlProd.crearTablaP()
    await sqlMens.crearTabla() 
}
createTables()
const app = express()

app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'handlebars')

const httpServer = new createServer(app)
const io = new Server(httpServer)

let messages 
let productos

app.get('/', (req, res) => {
    res.render('productos', null)
})

io.on('connection', async (socket) => {
    console.log('Un cliente se ha conectado!')
    productos = await sqlProd.getAll()
    messages = await sqlMens.getAllM()
    socket.emit('messages', messages)
    socket.emit('productos', productos)

    socket.on('new-message', async data => {
        await sqlMens.insertMensaje(data)
        messages = await sqlMens.getAllM()
        io.sockets.emit('messages', messages)
    })

    socket.on('new-producto', async data => {
        await sqlProd.insertProducto(data)
        productos = await sqlProd.getAll()
        io.sockets.emit('productos', productos)
    })
})

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, () => console.log('Iniciando en el puerto: ' + PORT))