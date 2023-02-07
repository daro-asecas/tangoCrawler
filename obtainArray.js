import puppeteer from 'puppeteer';

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto('https://developers.google.com/web/');

//   // Type into search box.
//   await page.type('.devsite-search-field', 'Headless Chrome');

//   // Wait for suggest overlay to appear and click "show all results".
//   const allResultsSelector = '.devsite-suggest-all-results';
//   await page.waitForSelector(allResultsSelector);
//   await page.click(allResultsSelector);

//   // Wait for the results page to load and display the results.
//   const resultsSelector = '.gsc-results .gs-title';
//   await page.waitForSelector(resultsSelector);

//   // Extract the results from the page.
//   const links = await page.evaluate(resultsSelector => {
//     return [...document.querySelectorAll(resultsSelector)].map(anchor => {
//       const title = anchor.textContent.split('|')[0].trim();
//       return `${title} - ${anchor.href}`;
//     });
//   }, resultsSelector);

//   // Print all the files.
//   console.log(links.join('\n'));

// //  await browser.close();
// })();

import fs from 'fs';
import { title } from 'process';

async function searchViator(searchTerm) {
  let results
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const urlSearched = "https://www.viator.com/es-ES/searchResults/all?text="+searchTerm

  await page.goto(urlSearched)

  const resultPhrase = await page.evaluate (() => {
    return document.querySelector(".title-count").textContent
  })

  const resultNumber = (() => {
    const start = resultPhrase.search("de") + 3
    const end = resultPhrase.search(" resultados ")
    return Number(resultPhrase.slice(start,end).replace(".",""))
  })()

  const resultShowedNumber = ((resultPhrase) => {
    const start = resultPhrase.search(" - ") + 3
    const end = resultPhrase.search("de")
    return Number(resultPhrase.slice(start,end).replace(".",""))
  })

  let showing = resultShowedNumber(resultPhrase)

  let clicks = 0
  let errors = 0
  showMoreResults()
  async function showMoreResults() {

    const resultPhrase = await page.evaluate (() => {
      return document.querySelector(".title-count").textContent
    })

    let firstError = false
    showing = resultShowedNumber(resultPhrase)

    if (showing!=resultNumber) {

      try{
        await page.click('.next-page-button')
        firstError = false
        clicks = clicks+1
        console.log("Clicks: "+clicks)
        console.log("Sh:"+showing)
        console.log("RN: "+resultNumber)


      } catch {
        firstError = true
        errors = errors+1
        console.log("Errors: "+errors)
      }

      // await page.waitForFunction(() => document.querySelectorAll("#productsList h2 > a").length > showing);
      // console.log("se mayor, sigo")
      // document.querySelector('.next-page-button').click();
      setTimeout(showMoreResults, firstError?700:300)
      // showMoreResults()
    } else {
      console.log("Sh:"+showing)
      console.log("grabArray")
      grabArray()
      // console.log("grabArray")
    }

////////////////// Recoger array de {title, url}
    async function grabArray() {
      results = await page.evaluate (() => {
        const anchors = Array.from(document.querySelectorAll("#productsList h2 > a"))
        return anchors.map((anchor) => {
          const title = anchor.textContent
          return {
            title,
            url: anchor.href
          }
        })
      })

      await browser.close()
      fs.writeFileSync("results.json", JSON.stringify(results,null,2))
      console.log(results)
      console.log(results.length)
      fs.writeFileSync('data/viatorTangoResults.json', JSON.stringify(results,null,2));
    }

  }



}

searchViator("tango");