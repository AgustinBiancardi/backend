import mongooose from 'mongoose';
import * as models from './models/productos.js';
import express from 'express'
import { Router } from 'express'
import admin from 'firebase-admin'
import fs from 'fs';
import { type } from 'os';

//CONEXIÓN A FIREBASE
const serviceAccount = JSON.parse(fs.readFileSync("./db/ecommerce-backend-229e4-firebase-adminsdk-9qqp0-eb4d53f58f.json"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
console.log("Conectado a firebase correctamente")

//CONEXIÓN A MONGO
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
//EXPRESS
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// RUTAS
const routerProductos = new Router()
const routerCarrito = new Router()

//OBTENER TODOS LOS PRODUCTOS
routerProductos.get('/', async (req, res) => {
    const productos = await models.productos.find();
    res.json(productos)
})

//OBTENER PRODUCTO POR ID
routerProductos.get('/:id', async (req, res) => {
    const idProd = parseInt(req.params.id)
    let productos = await models.productos.find();
    let hecho = mensaje(idProd, res, productos)
    if (hecho) {
        productos = await models.productos.find({ id: idProd });
        res.send(productos)
    }
})

let adminpermisos = true

// GUARDAR UN NUEVO PRODUCTO
routerProductos.post('/', async (req, res) => {
    if (adminpermisos) {
        let idProduct
        const productos = await models.productos.find();
        productos.length === 0 ? idProduct = 1 : idProduct = productos[productos.length - 1].id + 1
        let p = {
            id: idProduct,
            timestap: new Date().toDateString(),
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            codigo: req.body.codigo,
            precio: req.body.precio,
            stock: req.body.stock
        }
        await models.productos.create(p);
        res.send({ mensaje: 'Producto guardado correctamente.' })
    } else {
        return res.send({
            error: -1,
            descripcion: `Ruta ${req.url} - Metodo ${req.method} no autorizada.`
        })
    }
})

// ACTUALIZAR PRODUCTO POR ID
routerProductos.put('/:id', async (req, res) => {
    if (adminpermisos) {
        let productos = await models.productos.find();
        const id = parseInt(req.params.id)
        const newproducto = {
            id: id,
            timestap: new Date().toDateString(),
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            codigo: req.body.codigo,
            precio: req.body.precio,
            stock: req.body.stock
        }
        let hecho = mensaje(id, res, productos)
        if (hecho) {
            await models.productos.findOneAndUpdate({ id: id }, newproducto);
            res.send({ mensaje: 'Producto actualizado correctamente.' })
        }
    } else {
        return res.send({
            error: -1,
            descripcion: `Ruta ${req.url} - Metodo ${req.method} no autorizada.`
        })
    }
})

// ELIMINAR PRODUCTO POR ID
routerProductos.delete('/:id', async (req, res) => {
    if (adminpermisos) {
        let productos = await models.productos.find();
        const id = parseInt(req.params.id)
        let hecho = mensaje(id, res, productos)
        if (hecho) {
            await models.productos.deleteOne({ id: id })
            res.send({ mensaje: 'Producto eliminado correctamente' })
        }
    } else {
        return res.send({
            error: -1,
            descripcion: `Ruta ${req.url} - Metodo ${req.method} no autorizada.`
        })
    }
})

//MENSAJES GENERICOS
function mensaje(id, res, array) {
    let arrId = []
    array.forEach(element => {
        arrId.push(Number(element.id))
    });
    let found = arrId.find(element => element === id);
    if (isNaN(id)) {
        res.send({ error: 'Error. Especifica un id numerico.' })
        return false
    } else if (!found) {
        res.send({ error: 'Error. El id especificado no se encuentra.' })
        return false
    } else {
        return true
    }
}

//ROUTER CARRITO
routerCarrito.post('/', async (req, res) => {
    const db = admin.firestore();
    const query = db.collection("carritos");
    let idCarrito
    const carritos = await query.get()
    let docs = carritos.docs
    docs.length === 0 ? idCarrito = 1 : idCarrito = Number(docs[docs.length - 1].id) + 1
    console.log(idCarrito)
    let doc = query.doc(`${idCarrito}`)
    await doc.create({ timestap: new Date().toDateString(), items: [] })
    res.send({ mensaje: 'ok' })
})

//BORRAR UN CARRITO POR ID
routerCarrito.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const db = admin.firestore();
    const query = db.collection("carritos");
    const carritos = await query.get()
    let docs = carritos.docs
    console.log(docs)
    let hecho = mensaje(id, res, docs)
    if (hecho) {
        let doc = query.doc(`${id}`)
        const item = await doc.delete()

        res.send({ mensaje: 'El carrito ha sido borrado correctamente' })
    }
})

//AGREGAR PRODUCTOS A UN CARRITO
routerCarrito.post('/:id/productos/:id_prod', async (req, res) => {
    const id = parseInt(req.params.id)
    const id_prod = parseInt(req.params.id_prod)

    const db = admin.firestore();
    const query = db.collection("carritos");
    const carritos = await query.get()
    let docs = carritos.docs

    let productos = await models.productos.find();

    let hechoC = mensaje(id, res, docs)
    if (hechoC) {
        let hechoP = mensaje(id_prod, res, productos)
        if (hechoP) {
            let productoSeleccionado = productos = await models.productos.findOne({ id: id_prod })
            let doc = query.doc(`${id}`);
            const itemm = await doc.get()
            const response = itemm.data()
            let items = response.items
            items.push(productoSeleccionado)
            await doc.update({ items: items })
            res.send({ mensaje: "Tu producto ha sido guardado correctamente" })
        }
    }
})

//VER LOS PRODUCTOS POR ID DE CARRITO
routerCarrito.get('/:id/productos', async (req, res) => {
    const id = parseInt(req.params.id)
    const db = admin.firestore();
    const query = db.collection("carritos");
    const carritos = await query.get()
    let docs = carritos.docs

    let hecho = mensaje(id, res, docs)
    if (hecho) {
        let doc = query.doc(`${id}`);
        const itemm = await doc.get()
        const response = itemm.data()
        let items = response.items
        res.send({mensaje: items})
    }
})

//ELIMINAR PRODUCTOS DE UN CARRITO
routerCarrito.delete('/:id/productos/:id_prod', async (req, res) => {
    const id = parseInt(req.params.id)
    const id_prod = parseInt(req.params.id_prod)
    await buscar("carrito")
    await buscar("productos")

    let hechoC = mensaje(id, res, "carrito")
    if (hechoC) {
        let hechoP = mensaje(id_prod, res, "productos")
        if (hechoP) {
            let carritoSeleccionado
            datosCarrito.forEach(element => {
                if (element.id === id) {
                    carritoSeleccionado = element
                }
            });

            carritoSeleccionado.items = carritoSeleccionado.items.filter(element => element.id != id_prod);

            res.send(carritoSeleccionado)
            for (let i = 0; i < datosCarrito.length; i++) {
                if (datosCarrito[i].id === id) {
                    datosCarrito[i] = carritoSeleccionado
                }
            }
            await actualizar("carrito", datosCarrito)
        }
    }
})

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarrito)

//ERROR SI EL USUARIO TIPEA MAL LA URL
app.use((req, res) => {
    const mensaje = `Ruta ${req.url} - Método ${req.method} no implementado`
    res.status(404).json({
        error: -2,
        descripcion: mensaje
    })
})

// Levantar Server
const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${server.address().port}`)
})
server.on('error', error => console.log(`Error en servidor ${error}`))