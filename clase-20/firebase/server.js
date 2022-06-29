var admin = require("firebase-admin");
var serviceAccount = require("./db/ecommerce-backend-229e4-firebase-adminsdk-9qqp0-ee7252a6db.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
console.log("Conectado a firebase correctamente")
CrearUsuario();
async function CrearUsuario() {
    const db = admin.firestore();
    const query = db.collection("usuarios");
    try {
        let id = 1;
        let doc = await query.doc(id.toString())
        await doc.create({ nombre: "Marcos", apellido: "Villanueva" })
        console.log("Usuario creado")
    }
    catch (error) {
        console.log(error);
    }
}