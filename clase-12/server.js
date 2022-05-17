const express = require('express')
const handlebars = require('express-handlebars')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()

app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.use(express.urlencoded({extended : true}))
app.set('view engine', 'handlebars')

const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const messages = []

app.get('/', (req, res) => {
    res.render('productos', {messages})
})

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado!')

    socket.emit('messages', messages)

    socket.on('new-message', data => {
        messages.push(data)

        io.sockets.emit('messages', messages)
    })
})

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, () => console.log('Iniciando en el puerto: ' + PORT))