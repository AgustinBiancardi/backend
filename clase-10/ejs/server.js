const express = require('express')

const app = express()


app.set('views', './views')
app.use(express.urlencoded({extended : true}))

app.set('view engine', 'ejs')
let productos =[]

app.get('/', (req, res) => {
    res.render('inicio', {productos})
})

app.post('/productos', (req, res) => {
    productos.push(req.body) 
    res.redirect('/')
})

app.get('/productos', (req, res) => {
    res.render('productos',{productos})
})

app.listen(8080)