import mongooose from 'mongoose';
import * as models from './models/productos.js';
import express from 'express'
import { Router } from 'express'
import admin from 'firebase-admin'
import fs from 'fs';
import { type } from 'os';
import { response } from 'express';

//CONEXIÓN A FIREBASE
const serviceAccount = JSON.parse(fs.readFileSync("./db/ecommerce-backend-229e4-firebase-adminsdk-9qqp0-eb4d53f58f.json"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestoreA = admin.firestore()
firestoreA.settings({ ignoreUndefinedProperties: true })
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
    productos = await models.productos.find({ id: idProd });
    res.send(productos)
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

        await models.productos.findOneAndUpdate({ id: id }, newproducto);
        res.send({ mensaje: 'Producto actualizado correctamente.' })

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
        await models.productos.deleteOne({ id: id })
        res.send({ mensaje: 'Producto eliminado correctamente' })

    } else {
        return res.send({
            error: -1,
            descripcion: `Ruta ${req.url} - Metodo ${req.method} no autorizada.`
        })
    }
})

//ROUTER CARRITO
routerCarrito.post('/', async (req, res) => {
    const db = admin.firestore();
    const query = db.collection("carritos");
    let idCarrito
    const carritos = await query.get()
    // console.log('carritos: ', carritos)
    let docs = carritos.docs
    docs.length === 0 ? idCarrito = 1 : idCarrito = Number(docs[docs.length - 1].id) + 2
    console.log(idCarrito)
    let doc = query.doc(`${idCarrito}`)
    const { items } = req.body
    await doc.create({ items })
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
    let doc = query.doc(`${id}`)
    const item = await doc.delete()

    res.send({ mensaje: 'El carrito ha sido borrado correctamente' })
})

//AGREGAR PRODUCTOS A UN CARRITO
routerCarrito.put('/:id/productos', async (req, res) => {
    const id = req.params.id
    const { items } = req.body;
    try {
        const db = admin.firestore();
        const query = db.collection("carritos");
        let item = await models.productos.findOne({ _id: items })

        console.log('item en bd---->', item)
        let ref = query.doc(id);
        const itemm = await ref.get()
        const response = itemm.data()
        console.log('carrito-->', response)
        let arrayItems = response.items
        await ref.update({ items: arrayItems.concat(items) })
        res.send({ mensaje: "Tu producto ha sido guardado correctamente" })


    } catch (error) {
        console.log(error.message)
    }
})

//VER LOS PRODUCTOS POR ID DE CARRITO
routerCarrito.get('/:id/productos', async (req, res) => {
    const id = req.params.id
    const db = admin.firestore();
    const query = db.collection("carritos");
    const carritos = await query.get()
    let docs = carritos.docs

    let doc = query.doc(`${id}`);
    const itemm = await doc.get()
    const response = itemm.data()
    let items = response.items
    let item = await models.productos.findOne({ _id: items })
    res.json(items)
})

//ELIMINAR PRODUCTOS DE UN CARRITO
routerCarrito.delete('/:id/productos/:id_prod', async (req, res) => {
    const id = req.params.id
    const { id_prod } = req.params
    try {
        const db = admin.firestore();
        const query = db.collection("carritos");

        let item = await models.productos.findOne({ _id: id_prod })
        let ref = query.doc(id);
        const itemm = await ref.get()
        const response = itemm.data()
        let arrayItems = response.items
        console.log(arrayItems)
        arrayItems = arrayItems.filter(element => element != id_prod)
        await ref.update({ items: arrayItems })
        res.send({ mensaje: "Tu producto ha sido eliminado correctamente" })

    } catch (error) {
        console.log(error.message)

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