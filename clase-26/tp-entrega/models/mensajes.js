const mongoose = require ('mongoose')

const mensajesCollection = 'mensajes';

const MensajeSchema = new mongoose.Schema({
    id: {type: Number, required:true},
    mensajes: {type: Array, required:true}
})

const mensajes = mongoose.model(mensajesCollection, MensajeSchema);
module.exports = {
    mensajes
}