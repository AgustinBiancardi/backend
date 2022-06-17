import knex from 'knex'
import { options } from './options/mysqlconfig.js'
import { optionsqlite } from './options/sqlite.js'

class SQL {
    constructor(options) {
        this.knex = knex(options)
    }

    getAll() {
        return this.knex('productos').select('*')
    }

    insertProducto(articulo) {
        return this.knex('productos').insert(articulo)
    }

    async crearTabla() {
        
            return this.knex.schema.dropTableIfExists('mensajes')
                .finally(()=>{
                    return this.knex.schema.createTable('mensajes', table => {
                            table.increments('id').primary()
                            table.string('email', 100).notNullable()
                            table.string('mensaje', 100).notNullable()
                            table.string('fyh', 100).notNullable()
                        })
                })

    }

    async crearTablaP() {
        
        return this.knex.schema.dropTableIfExists('productos')
            .finally(()=>{
                return this.knex.schema.createTable('productos', table => {
                     table.increments('id').primary()
                     table.string('nombre', 100).notNullable()
                     table.float('precio')
                     table.string('url', 100).notNullable()
                    })
                })
    }

    getAllM() {
        return this.knex('mensajes').select('*')
    }

    insertMensaje(mensaje) {
        return this.knex('mensajes').insert(mensaje)
    }
}

export const tableProduct = new SQL(options)
export const tableMessages = new SQL(optionsqlite)
