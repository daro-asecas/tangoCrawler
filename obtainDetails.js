import puppeteer from 'puppeteer';
import fs from 'fs';

// import { puppeteerInit } from './obtainArray.js'; // intente hacerlo via import pero fallaba. Sera por el scope de BROWSER y PAGE?

let browser, page

const puppeteerInit = async (URL) => { // ver comentario en linea 3
  browser = await puppeteer.launch()
  page = await browser.newPage()
  if (URL) { await page.goto(URL) }
}

async function expandAndGrabSingleElement(buttonToClickSelector, grabDataFromSelector) {
  try{
    await page.waitForSelector(buttonToClickSelector)
    .then (await page.click(buttonToClickSelector))
    .then (await page.waitForSelector(grabDataFromSelector))
    return await page.evaluate ((grabDataFromSelector) => {
      return document.querySelector(grabDataFromSelector).textContent
    }, grabDataFromSelector)
  } catch { return "" }
}

async function expandAndGrabLanguages() { // pensaba exportarla, pero la testeo dentro de grabData
  const buttonToClickSelector = 'button[class^="link"][aria-label]'
  const grabDataFromSelector = 'p[class^="languageTooltipText"]'
  const languages = await expandAndGrabSingleElement(buttonToClickSelector, grabDataFromSelector)
  return languages.split(", ")
}

async function expandAndGrabImageURLs() { // pensaba exportarla, pero la testeo dentro de grabData
  const buttonToClickSelector = 'div[class*="arrowNext"]'
  const grabDataFromSelector = 'img[data-automation^="gallery-image"][class^="image"]'

  try{
    await page.waitForSelector(buttonToClickSelector)
    let imgArrayLenght = 0
    let tries = 0
    while (imgArrayLenght<5 && tries<10) {
      await page.click(buttonToClickSelector)
      .then (await new Promise(r => setTimeout(r, 500)))
      imgArrayLenght = await page.evaluate ((grabDataFromSelector) => {
        return document.querySelectorAll(grabDataFromSelector).length
      }, grabDataFromSelector)
      ++tries
    }
    return await page.evaluate ((grabDataFromSelector) => {
      return Array.from(document.querySelectorAll(grabDataFromSelector)).map((element)=>{
        return element.src
      })
    }, grabDataFromSelector)
  } catch (error) { return [] }
}

// la hare despues
// async function expandAndIncludedAndNot() { // pensaba exportarla, pero la testeo dentro de grabData
//   const buttonToClickSelector = 'div[class^="sectionContentWrapper"] button[class^="seeMoreLink"]'
//   const ulListSelector = '.ReactModalPortal ul[class^="featureList"]'
//   const grabDataFromSelector = '.ReactModalPortal ul[class^="featureList"]'

//   try{
//     await page.waitForSelector(buttonToClickSelector)
//     let imgArrayLenght = 0
//     let tries = 0
//     while (imgArrayLenght<5 && tries<10) {
//       await page.click(buttonToClickSelector)
//       .then (await new Promise(r => setTimeout(r, 500)))
//       imgArrayLenght = await page.evaluate ((grabDataFromSelector) => {
//         return document.querySelectorAll(grabDataFromSelector).length
//       }, grabDataFromSelector)
//       ++tries
//     }
//     return await page.evaluate ((grabDataFromSelector) => {
//       return Array.from(document.querySelectorAll(grabDataFromSelector)).map((element)=>{
//         return element.src
//       })
//     }, grabDataFromSelector)
//   } catch (error) { return [] }
// }


// URL para probar obtainDetailsOfOneProgram
// const URL = "https://www.viator.com/es-ES/tours/Buenos-Aires/Tango-Porteo-Tango-Show-with-Optional-Dinner-and-Tango-Class-in-Buenos-Aires/d901-5674P91"

export async function obtainDetailsOfOneProgram(URL, test) {

  async function grabData() {
    const programData = await page.evaluate (() => {
      return {
        "name": document.querySelector("h1").textContent,
        "duration": document.querySelector('[class^="productAttributesList"] > li > [class^="item"] > div:nth-child(2)').textContent,
        "overview": document.querySelector('[data-automation="product_overview"] > div > div').textContent,                            // "Experience the passion...
        "overviewTags": Array.from(document.querySelectorAll('div[data-automation="product_overview"] > ul[class^=featureList] > li > div'))
                         .map((element) => {return element.outerText}),
        // "included": [ ], // Fn a parte para esto, requiere clicks    // hay que hacerla en linea 56
        // "notIncluded": [], // Fn a parte para esto, requiere clicks  // hay que hacerla en linea 56

        // "id": ,           // esto se hace en la fn iterable sobre todos
        // "offeredIn": [],  // Fn a parte para esto, requiere clicks
        // "imgURLs": [],    // Fn a parte para esto, requiere clicks
        // "realLink": "",   // lo agrego al final, ya tengo la URL
      }
    })
    return programData
  }

  if (test) {await puppeteerInit(URL)}

  const programData = await grabData()
  programData.offeredIn = await expandAndGrabLanguages()
  programData.imgURLs = await expandAndGrabImageURLs()
  programData.realLink = URL

  return programData
}
// console.log(await obtainDetailsOfOneProgram(URL, 1))


export async function obtainDetailsOfAllPrograms(file, maxProgramsToGet) {

  
  /*// Por algun motivo esta funcion no anda
  async function getData(file) {
      try { await fs.readFile(file, async (data) => { return JSON.parse(data) })
      } catch { return "" }
    }
  */

  const getData = (file) => {
      return new Promise((resolve, reject) => { 
          fs.readFile(file, (err, data) => {
            if (err) return reject(err);
            try {
                const json = JSON.parse(data);
                resolve(json);
            } catch (E) {
                reject(E);
            }
          })
      })
  }

  const programs = []
  const savedPrograms = await getData(file)
  await puppeteerInit()
  for (const [index, program] of savedPrograms.entries()) {
    if (index === maxProgramsToGet && maxProgramsToGet!=0) break
    try {
      // if (index===3) {a=a/0} // para probar el catch
      await page.goto(program.url)
      programs.push(await obtainDetailsOfOneProgram(program.url))
    } catch {
      programs.push({
        "name": program.title,
        "realLink": program.url,
      })
    } finally {
      programs[index].id= index+1
    }
  };

  return programs

}
