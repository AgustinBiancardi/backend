const mongoose = require ('mongoose')

const usuariosCollection = 'usuarios';

const UsuarioSchema = new mongoose.Schema({
    usuarios: {type: Array, required:true}
})

const usuarios = mongoose.model(usuariosCollection, UsuarioSchema);
module.exports = {
    usuarios
}