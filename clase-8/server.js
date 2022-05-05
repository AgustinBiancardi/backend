const express = require('express')
const { Router } = express

const app = express()

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Productos
const routerProductos = new Router()

const productos = []

//OBTENER TODOS LOS PRODUCTOS
routerProductos.get('/', (req, res) => {
    res.json(productos)
})

//OBTENER PRODUCTO POR ID
routerProductos.get('/:id', (req, res) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        return res.send({ error: 'producto no encontrado' })
    }

    if (id > productos.length) {
        return res.send({ error: 'producto no encontrado' })
    }
    let productoSeleccionado
    productos.forEach(element => {
        if(element.id === id){
            productoSeleccionado = element
        }
    });

    res.send(productoSeleccionado)
})

let idProduct = 1

// GUARDAR UN NUEVO PRODUCTO
routerProductos.post('/', (req, res) => {
    let p = {
        nombre: req.body.nombre,
        thumbail: req.body.imagen,
        precio: req.body.precio,
        id: idProduct
    }
    productos.push(p)
    idProduct++
    res.json(productos)
})

// ACTUALIZAR PRODUCTO POR ID
routerProductos.put('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const  newproducto = {
        nombre: "Liquid",
        thumbail: "url",
        precio: "500",
        id: id
    }
    if (isNaN(id)) {
        return res.send({ error: 'producto no encontrado' })
    }

    if (id > productos.length) {
        return res.send({ error: 'producto no encontrado' })
    }
    let productoSeleccionado
    productos.forEach(element => {
        if(element.id === id){
            productoSeleccionado = element
        }
    });
    const productoAnt = productoSeleccionado
    productoSeleccionado = newproducto
    res.send({ actualizada: productoSeleccionado, anterior: productoAnt })
})

// ELIMINAR PRODUCTO POR ID
routerProductos.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        return res.send({ error: 'El parámetro ingresado no es un número' })
    }

    if (id > productos.length) {
        return res.send({ error: 'El id está fuera de rango' })
    }
   
    const newProductos = productos.filter(element => element.id != id);

    res.send(newProductos)
})


// Carga de Routers

app.use('/api/productos', routerProductos)

// Levantar Server

const PORT = 8080
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${server.address().port}`)
})
server.on('error', error => console.log(`Error en servidor ${error}`))