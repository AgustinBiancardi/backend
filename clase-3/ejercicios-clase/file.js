const fs = require("fs")

// let data = fs.readFileSync("./archivos/text.txt","UTF-8") 

// console.log(data)

// fs.writeFileSync("./archivos/text.txt","CHAU CHICOOOS ")

// fs.appendFileSync("./archivos/text.txt"," HOY VAMOS A HACER UN PACK OPENING")
// fs.unlinkSync("./archivos/text.txt")

// ------------------------------------------------------------------------------


try {
    fs.writeFileSync("./archivos/fyh.txt", new Date().toLocaleString())
} catch (error) {
    throw new Error(console.log(error))
}

try {
    fs.readFileSync("./archivos/fyh.txt", "utf-8")
} catch (error) {
    throw new Error(console.log(error))
}


