const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const { engine: exphbs } = require('express-handlebars')
const express = require ('express')
const faker = require ('@faker-js/faker')
faker.locale = 'es';
const  mongoose = require ('mongoose')
const models = require ('./models/mensajes.js')
const modelsUsuarios = require ('./models/usuarios.js')
const normalize = require ('normalizr')
const schema = require ('normalizr')
const util = require ('util')
const session = require ('express-session')
const MongoStore = require ('connect-mongo')
const passport = require ('passport')
const { Strategy: LocalStrategy } = require('passport-local')


// --------------------------------------//
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
const app = express()


app.set('views', './views')
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main.hbs' }))
app.set('view engine', '.hbs')
app.use(
    express.urlencoded({ extended: true }),
    session({

        store: MongoStore.create({
            mongoUrl: 'mongodb+srv://agustinbiancardi:river2002@cluster1.9xgod.mongodb.net/usuarios?retryWrites=true&w=majority',
            mongoOptions: advancedOptions,
            ttl: 600
        }),


        secret: 'shh',
        resave: false,
        saveUninitialized: false,
    })
)

const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

connectToMongo()
async function connectToMongo() {
    try {
        const URL = "mongodb+srv://agustinbiancardi:river2002@cluster1.9xgod.mongodb.net/?retryWrites=true&w=majority"
        let conexion = await mongoose.connect(URL);
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

passport.use('register', new LocalStrategy({passReqToCallback: true}, async (username, password, done) => {


    
    let usuarios = await modelsUsuarios.usuarios.findById('62c78a89161643b3e7ae9a70')
    const usuario = usuarios.usuarios.find(usuario => usuario.username == username)

    if (usuario) {
        return done('user already registered')
    }

    const user = {
        username,
        password,
    }
    let newUsers = [...usuarios.usuarios, user]
    await modelsUsuarios.usuarios.findByIdAndUpdate("62c78a89161643b3e7ae9a70", { usuarios: newUsers });

    return done(null, user)
}))

//---------------------------------------------------//
// PASSPORT LOGIN
passport.use('login', new LocalStrategy(async (username, password, done) => {

    let usuarios = await modelsUsuarios.usuarios.findById('62c78a89161643b3e7ae9a70')
    console.log(usuarios.usuarios)
    const user = usuarios.usuarios.find(usuario => usuario.username == username)
    if (!user) {
        return done(null, false)
    }

    if (user.password != password) {
        return done(null, false)
    }

    return done(null, user)
}))

//---------------------------------------------------//
// SERIALIZAR Y DESERIALIZAR

passport.serializeUser(function (user, done) {
    done(null, user.username)
})

passport.deserializeUser(async function(username, done) {
    let usuarios = await modelsUsuarios.usuarios.findById('62c78a89161643b3e7ae9a70')
    const usuario = usuarios.find(usuario => usuario.username == username)
    done(null, usuario)
})

//---------------------------------------------------//
// MIDDLEWARES DE PASSPORT
app.use(passport.initialize())
app.use(passport.session())

//---------------------------------------------------//
function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/login')
    }
}

//---------------------------------------------------//
// RUTAS REGISTRO

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register.html')
})

app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/' }))

app.get('failregister', (req, res) => {
    res.render('register-error')
})

//---------------------------------------------------//
// RUTAS LOGIN

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/datos')
    }
    res.sendFile(__dirname + '/views/login.html')
})

app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/datos' }))

app.get('/faillogin', (req, res) => {
    res.render('login-error')
})

//---------------------------------------------------//
// RUTAS DATOS

app.get('/datos', isAuth, (req, res) => {
    if (!req.user.contador) {
    }
    productos = Array.from(new Array(5), (v, i) => crearProducto(i + 1))

    res.render('datos', {
        // datos: usuarios.find(usuario => usuario.username == req.user.username),
    })
})

//---------------------------------------------------//
// RUTAS LOGOUT

app.get('/logout', (req, res) => {
    req.logout(err => {
        res.redirect('/login')
    })
})

//---------------------------------------------------//
// RUTAS INICIO

app.get('/', isAuth, (req, res) => {
    res.redirect('/datos')
})


io.on('connection', async (socket) => {
    console.log('Un cliente se ha conectado!')
    let mensajes = await models.mensajes.findById("62b290452493b3ca492d2078");
    // const normalizeMensajes = normalizar(mensajes.mensajes)
    socket.emit('messages', mensajes.mensajes)

    socket.emit('productos', productos)

    socket.on('new-message', async data => {
        let mensajes = await models.mensajes.findById("62b290452493b3ca492d2078");
        let newMensajes = [...mensajes.mensajes, data]
        await models.mensajes.findByIdAndUpdate("62b290452493b3ca492d2078", { mensajes: newMensajes });
        io.sockets.emit('messages', newMensajes)
    })
})

// function normalizar(mensajes) {
//     const author = new schema.Entity('author', {

//     });
//     const text = new schema.Entity('text');
//     const mensaje = new schema.Entity('mensaje', {
//         author: author,
//         text: text
//     });
//     function print(objeto) {
//         console.log(util.inspect(objeto, false, 12, true))
//     }
//     const normalizechat = normalize(mensajes, [mensaje])

//     return normalizechat
// }

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, () => console.log('Iniciando en el puerto: ' + PORT))