import puppeteer from 'puppeteer';

// import { puppeteerInit } from './obtainArray.js'; // intente hacerlo via import pero fallaba. Sera por el scope de BROWSER y PAGE?

let browser;
let page;

const puppeteerInit = async (URL) => { // ver comentario en linea 3
  browser = await puppeteer.launch();
  page = await browser.newPage();
  if (URL) { await page.goto(URL); }
};

async function grabInitiallyShowedData() {
  const programData = {
    id: '', // Se llena en en la fn iterable
    name: '',
    duration: '',
    overview: '',
    overviewTags: [],
    included: [], //      Fn a parte para esto, requiere clicks  // hay que hacerlas en linea 82
    notIncluded: [], //   Fn a parte para esto, requiere clicks //  hay que hacerlas juntas
    offeredIn: [], //     Fn a parte para esto, requiere clicks
    imgURLs: [], //       Fn a parte para esto, requiere clicks
    realLink: '', //      Se llena en en la fn iterable
  };

  try {
    programData.name = await page.evaluate(() => document.querySelector('h1').textContent);
  } catch {}
  try {
    programData.duration = await page.evaluate(() => document.querySelector('[class^="productAttributesList"] > li > [class^="item"] > div:nth-child(2)').textContent);
  } catch {}
  try {
    programData.overview = await page.evaluate(() => document.querySelector('[data-automation="product_overview"] > div > div').textContent);
  } catch {}
  try {
    programData.overviewTags = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-automation="product_overview"] > ul[class^=featureList] > li > div'))
      .map((element) => element.outerText));
  } catch {}

  return programData;
}

async function expandAndGrabSingleElement(buttonToClickSelector, grabDataFromSelector) {
  try {
    await page.waitForSelector(buttonToClickSelector)
      .then(await page.click(buttonToClickSelector))
      .then(await page.waitForSelector(grabDataFromSelector));
    return await page.evaluate((grabDataFromSelector) => document.querySelector(grabDataFromSelector).textContent, grabDataFromSelector);
  } catch { return ''; }
}

async function expandAndGrabLanguages() { // pensaba exportarla, pero la testeo dentro de grabData
  const buttonToClickSelector = 'button[class^="link"][aria-label]';
  const grabDataFromSelector = 'p[class^="languageTooltipText"]';
  let languagesInArray;
  try {
    const languages = await expandAndGrabSingleElement(buttonToClickSelector, grabDataFromSelector);
    languagesInArray = languages.split(', ');
  } catch {
    languagesInArray = [];
  } finally {
    return languagesInArray;
  }
}

async function expandAndGrabImageURLs() { // pensaba exportarla, pero la testeo dentro de grabData
  const buttonToClickSelector = 'div[class*="arrowNext"]';
  const grabDataFromSelector = 'img[data-automation^="gallery-image"][class^="image"]';

  try {
    await page.waitForSelector(buttonToClickSelector);
    let imgArrayLenght = 0;
    let tries = 0;
    while (imgArrayLenght < 5 && tries < 10) {
      await page.click(buttonToClickSelector)
        .then(await new Promise((r) => setTimeout(r, 500)));
      imgArrayLenght = await page.evaluate((grabDataFromSelector) => document.querySelectorAll(grabDataFromSelector).length, grabDataFromSelector);
      tries += 1;
    }
    return await page.evaluate((grabDataFromSelector) => Array.from(document.querySelectorAll(grabDataFromSelector)).map((element) => element.src), grabDataFromSelector);
  } catch (error) { return []; }
}

/* la hare despues
async function expandAndIncludedAndNot() { // pensaba exportarla, pero la testeo dentro de grabData
  const buttonToClickSelector = 'div[class^="sectionContentWrapper"] button[class^="seeMoreLink"]'
  const ulListSelector = '.ReactModalPortal ul[class^="featureList"]'
  const grabDataFromSelector = '.ReactModalPortal ul[class^="featureList"]'

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
*/

export async function obtainDetailsOfOneProgram(URL, test) {
  if (test) { await puppeteerInit(URL); }

  const programData = await grabInitiallyShowedData();
  programData.offeredIn = await expandAndGrabLanguages();
  programData.imgURLs = await expandAndGrabImageURLs();
  programData.realLink = URL;

  return programData;
}
// console.log(await obtainDetailsOfOneProgram(URL, 1))

export async function obtainDetailsOfAllPrograms(arrayOfURLs, test) {
  const programs = [];
  await puppeteerInit();
  for (const [index, program] of arrayOfURLs.entries()) {
    try {
      await page.goto(program.url);
      programs.push(await obtainDetailsOfOneProgram(program.url));
    } catch {
      programs.push({
        id: 0,
        name: program.title,
        realLink: program.url,
      });
    } finally {
      programs[index].id = index + 1;
      if (!test) { console.log('Copiados: ', index); } // eslint-disable-line
    }
  }

  try {
    await browser.close();
  } catch {
  }

  return programs;
}
