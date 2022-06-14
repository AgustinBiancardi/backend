import knex from 'knex'

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

    crearTabla() {

        return this.knex.schema.hasTable('mensajes', exist => {
            if (!exist)
                this.knex.schema.createTable('mensajes', table => {
                    table.increments('id').primary()
                    table.string('email', 100).notNullable()
                    table.string('mensaje', 100).notNullable()
                    table.string('fyh', 100).notNullable()
                })
        })

    }

    crearTablaP() {

        return this.knex.schema.hasTable('productos', exist => {
            if (!exist)
                this.knex.schema.createTable('productos', table => {
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

export default SQL