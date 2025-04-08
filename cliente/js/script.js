async function obtenerDatos() {
    try {
        const response = await fetch('http://192.168.100.5:3000/data');
        const datos = await response.json();

        if (datos.length > 0) {
            actualizarDatos(datos[0].zona, datos[0].decibelios, datos[0].fecha)
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
setInterval(obtenerDatos, 2000);