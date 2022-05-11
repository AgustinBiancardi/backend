const express = require("express")
const { promises: fs} = require('fs')
const app = express()
app.engine('cte', async (filePath, options, callback) => {
    try {const template = await fs.readFile(filePath)
        const renderizado = template.toString()
                            .replace('^^titulo$$', '' + options.titulo + '')
                            .replace('^^mensaje$$', '' + options.mensaje + '')
                            .replace('^^autor$$', '' + options.autor + '')
                            .replace('^^version$$', '' + options.version + '')
                            return callback(null, renderizado)} 
    catch (err) {
        return callback(err)
    }})
app.set('views', './views')
app.set('view engine', 'cte')
app.get('/', (req, res) => {
    const datos = {titulo: 'Bienvenidos al himalaya',
    mensaje: '3-14',
    autor: 'Sully',
    version: '1.0.0'}
    res.render('plantilla1', datos)
})
app.listen(8080)