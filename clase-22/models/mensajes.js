import mongooose from 'mongoose';

const mensajesCollection = 'mensajes';

const MensajeSchema = new mongooose.Schema({
    id: {type: Number, required:true},
    mensajes: {type: Array, required:true}
})

export const mensajes = mongooose.model(mensajesCollection, MensajeSchema);