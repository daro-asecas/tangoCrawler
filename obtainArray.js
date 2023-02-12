import puppeteer from 'puppeteer';
import fs from 'fs';

let browser, page

export const buildBaseUrl = (searchTerm) => "https://www.viator.com/es-ES/searchResults/all?text=" + searchTerm

export const puppeteerInit = async (URL) => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    if (URL) { await page.goto(URL) }
  }

export const getNumberOfResults = ((resultPhrase) => {
  const start = resultPhrase.search("de") + 3
  const end = resultPhrase.search(" resultados ")
  return Number(resultPhrase.slice(start,end).replace(".",""))
})

export const resultShowedNumber = ((resultPhrase) => {
  const start = resultPhrase.search(" - ") + 3
  const end = resultPhrase.search("de")
  return Number(resultPhrase.slice(start,end).replace(".",""))
})

export async function searchViator(searchTerm, maxProgramsToGet, isTest) { // test es un boolean que se usa para hacer test unitarios
  let clicks = 0
  let errors = 0
  let results

  const urlSearched = buildBaseUrl(searchTerm)
  await puppeteerInit(urlSearched);

  const resultPhrase = await page.evaluate (() => {return document.querySelector(".title-count").textContent})

  const numberOfResults = getNumberOfResults(resultPhrase, maxProgramsToGet)


  /*// Esta es la definicion recursiva, pero era mas complicado para invocar grabArray desde afuera de la funcion, al terminar
  // async function showMoreResults() {
    
    //   const resultPhrase = await page.evaluate (() => {
      //     return document.querySelector(".title-count").textContent
      //   })

  //   let firstError = false
  //   showing = resultShowedNumber(resultPhrase)

  //   if (showing<70) {
  //   // if (showing!=numberOfResults) {

  //     try{
  //       const button = await page.waitForSelector('.next-page-button')
  //         .then (async () => {await page.click('.next-page-button')})
  //         .then (()=>{
  //           firstError = false
  //           clicks = clicks+1
  //           console.log("-------------------------------------------")
  //           console.log(`Clicks: ${clicks}`)
  //           console.log(`Showing: ${showing} of ${numberOfResults}, adding resuts`)
  //           console.log("-------------------------------------------")
  //         })
  //     } catch (error) {
  //       firstError = true
  //       errors = errors+1
  //       console.log(`Errors: ${errors}`)
  //     } finally {
  //       setTimeout(showMoreResults, firstError?700:150)
  //     }
  //   } else {
  //     console.log(`Showing: ${showing} of ${numberOfResults}`)
  //     console.log("-------------------------------------------")
  //     console.log("grabArray")
  //     grabArray()
  //   }
  // }
  */

  async function showMoreResults() {
    let showing = resultShowedNumber(resultPhrase)
    let firstError = false

    while (showing < maxProgramsToGet && showing < numberOfResults) {
      try{
        const resultPhrase = await page.evaluate (() => {return document.querySelector(".title-count").textContent})
        const button = await page.waitForSelector('.next-page-button')
          .then (async () => {await page.click('.next-page-button')})
          .then (()=>{
            firstError = false
            clicks = clicks+1
            console.log("-------------------------------------------")
            console.log(`Clicks: ${clicks}`)
            console.log(`Showing: ${showing} of ${numberOfResults}, adding resuts`)
            console.log("-------------------------------------------")
          })
      } catch (error) {
        firstError = true
        errors = errors+1
        console.log(`Errors: ${errors}`)
      } finally {
        await new Promise(r => setTimeout(r, firstError?700:150))
        showing = resultShowedNumber(resultPhrase)
      }
    }
    console.log(`Showing: ${showing} of ${numberOfResults}.`)
    console.log("Grabbing Array")
    console.log("-------------------------------------------")

  }

  async function grabArray() {
    return await page.evaluate ((maxProgramsToGet) => {
      let anchors = Array.from(document.querySelectorAll("#productsList h2 > a"))
      console.log("maxProgramsToGet = "+maxProgramsToGet)
      console.log(typeof(maxProgramsToGet))
      console.log(maxProgramsToGet!=0)
      if (typeof(maxProgramsToGet)==='number' && maxProgramsToGet!=0) {
        anchors = anchors.slice(0, maxProgramsToGet)
        console.log(anchors)
      }
      return anchors.map((anchor) => {
        const title = anchor.textContent
        return {
          title,
          url: anchor.href
        }
      })
    }, maxProgramsToGet)
  }

  async function closeAndSave(results) {
    await browser.close()
    fs.writeFileSync("data/viatorTangoResults.json", JSON.stringify(results,null,2))
    console.log(`Total items saved: ${results.length}`)
  }

  if (!isTest) { await showMoreResults() }

  results = await grabArray()
  
  if (!isTest) { await closeAndSave(results)
  } else { return results }
}