const express = require('express')
const fs = require("fs")

const PORT = 8080

const app = express()

const server = app.listen(PORT, () => {
    console.log('Servidor HTTP escuchando en el puerto ' + PORT)
})

app.get('/', (req, res) => {
    res.send('<h1 style="color:blue;">Bienvenidos al catalogo de productos</h1>')
})

app.get('/productos',  (req, res) => {
  
  let catalogo = new Contenedor("./productos.txt")

  async function buscar(){     
    const productos = await catalogo.getAll() 
    res.send("Totalidad de productos en stock: " + productos.map((prod) => 
    `
    <li>${prod}</li>
    `))
  }
  buscar()
    
})

app.get('/producto-random',  (req, res) => {
  
  let catalogo = new Contenedor("./productos.txt")

  async function buscar(){     

    res.send("Producto al azar: " + await catalogo.getRandom())
  }
  buscar()
    
})

class Contenedor {
    constructor(path) {
    this.path = path
}

    async getAll(){
        try {
              const productos = await fs.promises.readFile(this.path,"utf-8")
              let obj = JSON.parse(productos)
              
              let nombreProductos = []
              obj.forEach(element => {
                nombreProductos.push(element.nombre)
              });
          
          return nombreProductos

        } catch (error) {
            return ("No se pudo leer el archivo " + error)
            throw new Error(error)
        }
    }
  
  async getRandom(){
        try {
              const productos = await fs.promises.readFile(this.path,"utf-8")
              let obj = JSON.parse(productos)
              let random
              return random = obj[parseInt(Math.random() * (obj.length - 0)) + 0].nombre

        } catch (error) {
            return ("No se pudo leer el archivo " + error)
            throw new Error(error)
        }
    }
    
}
