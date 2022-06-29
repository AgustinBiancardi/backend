const express = require('express')
const handlebars = require('express-handlebars')

const app = express()

app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.use(express.urlencoded({extended : true}))

app.set('view engine', 'handlebars')
let productos =[]

app.get('/', (req, res) => {
    res.render('datos', {productos})
})

app.post('/productos', (req, res) => {
    productos.push(req.body) 
    console.log(req.body)
    res.redirect('/')
})

app.get('/productos', (req, res) => {
    res.render('productos',{productos})
})

app.listen(8080)