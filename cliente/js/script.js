// Este script se encarga deobtener los datos de la API y actualizar la interfaz de usuario en tiempo rel
async function obtenerDatos() {
    try {
        const response = await fetch('http://192.168.1.9:3000/data');
        const zonas = await response.json();

        if (zonas.length > 0) {
            zonas.forEach(zona => actualizarDatos(zona.zona, zona.decibelios, zona.fecha))
            
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function actualizarDatos(zona, decibeles, fecha) {
    let barra = document.getElementById(`barra${zona}`)
    let valorDB = document.getElementById(`decibeles${zona}`)
    let fechaElemento = document.getElementById(`fecha${zona}`)
    let zonaElemento = document.getElementById(`zona${zona}`)

    valorDB.innerText = decibeles
    fechaElemento.innerText = fecha
    zonaElemento.innerText = zona
    
    let altura = Math.min(decibeles, 150)

    barra.style.height = `${altura/1.5}%`

    if (decibeles <= 60) {
        barra.style.background = "green"
    } else if (decibeles <= 105) {
        barra.style.background = "yellow"
    } else {
        barra.style.background = "red"
    }
}
setInterval(obtenerDatos, 500);