import mongooose from 'mongoose';

const productosCollection = 'productos';

const ProductoSchema = new mongooose.Schema({
    id: {type: Number, required:true},
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    codigo: { type: String, required: true },
    timestap: { type: String, required: true },
    stock: { type: Number, required: true },
    
})

export const productos = mongooose.model(productosCollection, ProductoSchema);