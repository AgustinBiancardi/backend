const express = require('express')
const { Router } = express
const fs = require("fs")

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// RUTAS
const routerProductos = new Router()
const routerCarrito = new Router()
//CLASE
class Contenedor {
    constructor(path) {
        this.path = path
    }
    async leer() {
        try {
            const base = await fs.promises.readFile(this.path, "utf-8")
            let obj = JSON.parse(base)

            return obj

        } catch (error) {
            return ("No se pudo leer el archivo " + error)
        }
    }
    async escribir(data) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2))
        } catch (error) {
            console.log("No se pudo guardar su producto: " + error)
            throw new Error(error)
        }
    }

}
async function buscar(tipo) {
    if (tipo === "productos") {
        datos = await productos.leer()
    } else {
        datosCarrito = await carritos.leer()
    }

}
async function actualizar(tipo, datos) {
    if (tipo === "productos") {
        await productos.escribir(datos)
    } else {
        await carritos.escribir(datos)
    }

}
let datos
let datosCarrito
let productos = new Contenedor("./productos.txt")
let carritos = new Contenedor("./carritos.txt")
//OBTENER TODOS LOS PRODUCTOS
routerProductos.get('/', async (req, res) => {
    await buscar("productos")
    res.json(datos)
})
//OBTENER PRODUCTO POR ID
routerProductos.get('/:id?', async (req, res) => {
    const id = parseInt(req.params.id)
    await buscar("productos")
    mensaje(id, res, "productos")
    let productoSeleccionado
    datos.forEach(element => {
        if (element.id === id) {
            productoSeleccionado = element
        }
    });

    res.send(productoSeleccionado)
})
let admin = true
// GUARDAR UN NUEVO PRODUCTO
routerProductos.post('/', async (req, res) => {
    if (admin) {
        let idProduct
        await buscar("productos")
        datos.length === 0 ? idProduct = 1 : idProduct = datos[datos.length - 1].id + 1
        let p = {
            id: idProduct,
            timestap: new Date().toDateString(),
            nombre: req.body.nombre,
            descripcion:req.body.descripcion,
            codigo:req.body.codigo,
            foto: req.body.imagen,
            precio: req.body.precio,
            stock:req.body.stock
        }
        datos.push(p)
        await actualizar("productos", datos)
        res.send({ mensaje: 'Producto guardado correctamente.' })
    } else {
        return res.send({ error: 'Error. No puedes guardar un nuevo producto siendo usuario.' })
    }
})
// ACTUALIZAR PRODUCTO POR ID
routerProductos.put('/:id', async (req, res) => {
    if (admin) {
        await buscar("productos")
        const id = parseInt(req.params.id)
        const newproducto = {
            id: id,
            timestap: new Date().toDateString(),
            nombre: req.body.nombre,
            descripcion:req.body.descripcion,
            codigo:req.body.codigo,
            foto: req.body.imagen,
            precio: req.body.precio,
            stock:req.body.stock
        }
        let hecho = mensaje(id, res, "productos")
        if (hecho) {
            let productoSeleccionado
            datos.forEach(element => {
                if (element.id === id) {
                    productoSeleccionado = element
                }
            });
            const productoAnt = productoSeleccionado
            productoSeleccionado = newproducto
            res.send({ actualizada: productoSeleccionado, anterior: productoAnt })
            for (let i = 0; i < datos.length; i++) {
                if (datos[i] === productoAnt) {
                    datos[i] = productoSeleccionado
                }
            }
            await actualizar("productos", datos)
        }
    } else {
        return res.send({ error: 'Error. No puedes realizar esta acción siendo usuario.' })
    }
})
// ELIMINAR PRODUCTO POR ID
routerProductos.delete('/:id', async (req, res) => {
    if (admin) {
        await buscar("productos")
        const id = parseInt(req.params.id)
        let hecho = mensaje(id, res, "productos")
        if (hecho) {
            datos = datos.filter(element => element.id != id);
            res.send(datos)
            await actualizar("productos", datos)
        }
    } else {
        return res.send({ error: 'Error. No puedes actualizar un prducto siendo usuario.' })
    }

})
//MENSAJES GENERICOS
function mensaje(id, res, tipo) {
    let arrId = []
    if (tipo === "productos") {
        datos.forEach(element => {
            arrId.push(element.id)
        });
    } else {
        datosCarrito.forEach(element => {
            arrId.push(element.id)
        });
    }
    found = arrId.find(element => element === id);
    if (isNaN(id)) {
        res.send({ error: 'Error. Especifica un id numerico.' })
        return false
    } else if (!found) {
        res.send({ error: 'Error. El id especificado de ' + tipo + ' no se encuentra.' })
        return false
    } else {
        return true
    }
}

//ROUTER CARRITO
routerCarrito.post('/', async (req, res) => {
    await buscar("carrito")
    let idCarrito
    datosCarrito.length === 0 ? idCarrito = 1 : idCarrito = datosCarrito[datosCarrito.length - 1].id + 1
    const newCarrito = {
        id: idCarrito,
        timestap: new Date().toDateString(),
        items: []
    }
    datosCarrito.push(newCarrito)
    await actualizar("carrito", datosCarrito)
    res.send({ mensaje: 'Carrito creado exitosamente. Su id es ' + idCarrito, carrito: newCarrito })
})
//BORRAR UN CARRITO POR ID
routerCarrito.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    await buscar("carrito")
    let hecho = mensaje(id, res, "carrito")
    if (hecho) {
        datosCarrito = datosCarrito.filter(element => element.id != id);
        res.send(datosCarrito)
        await actualizar("carrito", datosCarrito)
    }
})
//AGREGAR PRODUCTOS A UN CARRITO
routerCarrito.post('/:id/productos/:id_prod', async (req, res) => {
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
            let productoSeleccionado
            datos.forEach(element => {
                if (element.id === id_prod) {
                    productoSeleccionado = element
                }
            });

            carritoSeleccionado.items.push(productoSeleccionado)

            for (let i = 0; i < datosCarrito.length; i++) {
                if (datosCarrito[i].id === id) {
                    datosCarrito[i] = carritoSeleccionado
                }
            }
            res.send(datosCarrito)
            await actualizar("carrito", datosCarrito)
        }
    }
})
//VER LOS PRODUCTOS POR ID DE CARRITO
routerCarrito.get('/:id/productos', async (req, res) => {
    const id = parseInt(req.params.id)
    await buscar("carritos")

    let hecho = mensaje(id, res, "carrito")
    if (hecho) {
        let carritoSeleccionado
        datosCarrito.forEach(element => {
            if (element.id === id) {
                carritoSeleccionado = element
            }
        });
        res.send(carritoSeleccionado)
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

// Carga de Routers

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarrito)

// Levantar Server

const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${server.address().port}`)
})
server.on('error', error => console.log(`Error en servidor ${error}`))