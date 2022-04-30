function mostrarLetras(string,cb){
    let i = 0
    const myInterval = setInterval(() => {
        if(i<string.length){
            console.log(string[i])
            i++
        }else{
            clearInterval(myInterval)
            cb()
        }
       
    },1000);
    
}

const fin = () => console.log("termine")

setTimeout(() => {mostrarLetras("¡hola!",fin)}, 0);
setTimeout(() => {mostrarLetras("¡hola!",fin)}, 250);
setTimeout(() => {mostrarLetras("¡hola!",fin)}, 500);