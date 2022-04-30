class Usuario {
    constructor(nombre, apellido,libros,mascotas) {
      this.nombre = nombre;
      this.apellido = apellido;
      this.libros = libros;
      this.mascotas = mascotas;
    }

    getFullName(){
        return `${this.nombre} ${this.apellido}`
    }

    addMascotas(mascota){
        this.mascotas.push(mascota)
    }

    countMascotas(){
        return this.mascotas.length
    }

    addBook(nombre,autor){
        this.libros.push(
            {
                nombre:nombre,
                autor:autor
            }
        )
    }

    getBookNames(){
        let nombreDeLibros = []
        this.libros.forEach(libro => {
            nombreDeLibros.push(libro.nombre)
        });
        return nombreDeLibros
    }
}

let usuario1 =new Usuario("Agustin","Biancardi",[{nombre:"Harry Poter",autor:"Pepito"}],["Perro","Gato"])

console.log(usuario1.getFullName())
usuario1.addMascotas("Loro")
usuario1.addBook("El Principito","Fulano")
console.log(usuario1.countMascotas())
console.log(usuario1.getBookNames())
console.log(usuario1)