const express = require('express')

const app = express()


app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.urlencoded({extended : true}))

let productos =[]

app.get('/', (req, res) => {
    res.render('formulario', {productos})
})

app.post('/productos', (req, res) => {
    productos.push(req.body) 
    res.redirect('/')
})

app.get('/productos', (req, res) => {
    res.render('productos',{productos})
})

app.listen(8080)