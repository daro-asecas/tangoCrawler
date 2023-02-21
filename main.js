import { searchViator } from './obtainArray.js';
import { obtainDetailsOfAllPrograms } from './obtainDetails.js';
import { saveInDotJSON, getDataFromDotJSON } from './operateDotJSON.js';

// CONFIGURACION
const maxProgramsToGet = 30;
const doSearch = false;
const grabDetails = true;
const saveArrayOfUrlsIn = './data/viatorTangoResults(el que falla).json';
const saveDetailsIn = './data/viatorTangoDetails(2).json';

// OBTENER RESULTADOS DE BUSQUEDA
if (doSearch) {
  const results = await searchViator('tango', maxProgramsToGet);
  saveInDotJSON(saveArrayOfUrlsIn, results);
  console.log(`Total items saved: ${results.length}`); // eslint-disable-line
  console.log('In file: ',`\x1b[32m${saveArrayOfUrlsIn}\x1b[0m`); // eslint-disable-line
}

// OBTENER DETALLES DE ESOS RESULTADOS
if (grabDetails) {
  const arrayOfUrls = (await getDataFromDotJSON(saveArrayOfUrlsIn)).slice(0, maxProgramsToGet);
  const details = await obtainDetailsOfAllPrograms(arrayOfUrls);
  await saveInDotJSON(saveDetailsIn, details);
  console.log(`Grabbed details from ${details.length} programs`); // eslint-disable-line
  console.log('In file: ',`\x1b[32m${saveDetailsIn}\x1b[0m`); // eslint-disable-line
}
