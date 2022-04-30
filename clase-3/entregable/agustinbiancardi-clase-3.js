const fs = require("fs")

class Contenedor {
    constructor(path) {
        this.path = path
    }

    async save(objeto){
        try {
            const productos = await fs.promises.readFile(this.path,"utf-8")
            let obj = JSON.parse(productos)
            objeto.id = obj.productos[obj.productos.length - 1].id + 1
            obj.productos.push(objeto) 

            try {
                await fs.promises.writeFile(this.path,JSON.stringify(obj,null,2))
                console.log("hecho, ID asignado: " + objeto.id)
            } catch (error) {
                console.log("No se pudo guardar su producto: " + error)
                throw new Error(error)
            }

        } catch (error) {
            console.log("No se pudo leer el archivo " + error)
            throw new Error(error)
        }
    }

    async getById(id){
        try {
            const productos = await fs.promises.readFile(this.path,"utf-8")
            let obj = JSON.parse(productos)
            let productoEncontrado = false
            
            obj.productos.forEach(producto => {
                if(producto.id == id){
                    productoEncontrado = producto
                }
            });

            (productoEncontrado)? console.log(JSON.stringify(productoEncontrado,null,2)) :  console.log(null)

        } catch (error) {
            console.log("No encontramos el producto seleccionado " + error)
            throw new Error(error)
        }
    }

    async getAll(){
        try {
            const productos = await fs.promises.readFile(this.path,"utf-8")
            let obj = JSON.parse(productos)

            console.log(JSON.stringify(obj.productos,null,2))

        } catch (error) {
            console.log("No se pudo leer el archivo " + error)
            throw new Error(error)
        }
    }

    async deleteById(id){
        try {
            const productos = await fs.promises.readFile(this.path,"utf-8")
            let obj = JSON.parse(productos)

            const resultado = {
                productos : obj.productos.filter(producto => producto.id != id)
            }

            try {
                await fs.promises.writeFile(this.path,JSON.stringify(resultado,null,2))
                console.log("hecho, producto boorado")
            } catch (error) {
                console.log("No se pudo borrarr su producto: " + error)
                throw new Error(error)
            }

        } catch (error) {
            console.log("No se pudo leer el archivo " + error)
            throw new Error(error)
        }
    }

    async deleteAll(){
        try {
            const productos = await fs.promises.readFile(this.path,"utf-8")
            let obj = JSON.parse(productos)
            let newobj = obj

            newobj= {
                productos:[

                ]
            }

            try {
                await fs.promises.writeFile(this.path,JSON.stringify(newobj,null,2))
                console.log("productos borrados")
            } catch (error) {
                console.log("No se pudieron borrar productos" + error)
                throw new Error(error)
            }

        } catch (error) {
            console.log("No se pudo leer el archivo " + error)
            throw new Error(error)
        }
    }
}

let catalogo = new Contenedor("./productos.txt")
let p = {
    nombre: "liquid",
    precio: 100,
    url: "url"
}
catalogo.save(p)
catalogo.getById(2)
catalogo.getAll()
// catalogo.deleteById(1)
// catalogo.deleteAll()

