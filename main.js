import { searchViator } from "./obtainArray.js";
import { obtainDetailsOfAllPrograms } from "./obtainDetails.js";
import fs from 'fs';

// CONFIGURACION

const maxProgramsToGet = 5
const doSearch = true
const grabDetails = true
// const fileToGetDataFrom = "./data/viatorTangoResults(5).json" // si DoSearch es false



// OBTENER RESULTADOS DE BUSQUEDA

if (doSearch) { await searchViator("tango", maxProgramsToGet) }

    // Para ejecutar la funcion como se ejecutaria en el test
    // comentar la linea 3 y usar la 8:
// console.log(await searchViator("tango",true));



// OBTENER DETALLES DE ESOS RESULTADOS

if (grabDetails) {
    const defaultFile = "./data/viatorTangoResults.json"
    const file = typeof(fileToGetDataFrom)!= 'undefined'?fileToGetDataFrom:defaultFile
    const details = await obtainDetailsOfAllPrograms(file, maxProgramsToGet)
    fs.writeFileSync("data/viatorTangoDetails.json", JSON.stringify(details,null,2))
    console.log(`Grabbed details from ${details.length} programs`)
}




