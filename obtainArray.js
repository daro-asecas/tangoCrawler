import puppeteer from 'puppeteer';

let browser;
let page;

export const buildBaseUrl = (searchTerm) => `https://www.viator.com/es-ES/searchResults/all?text=${searchTerm}`;

export const puppeteerInit = async (URL) => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  if (URL) { await page.goto(URL); }
};

export const getNumberOfResults = ((resultPhrase) => {
  const start = resultPhrase.search('de') + 3;
  const end = resultPhrase.search(' resultados ');
  return Number(resultPhrase.slice(start, end).replace('.', ''));
});

export const resultShowedNumber = ((resultPhrase) => {
  const start = resultPhrase.search(' - ') + 3;
  const end = resultPhrase.search('de');
  return Number(resultPhrase.slice(start, end).replace('.', ''));
});

export async function searchViator(searchTerm, maxProgramsToGet, isTest) {
  // isTest es un boolean que se usa para hacer los test unitarios

  const urlSearched = buildBaseUrl(searchTerm);
  await puppeteerInit(urlSearched);

  const resultPhrase = await page.evaluate(() => document.querySelector('.title-count').textContent);

  const numberOfResults = getNumberOfResults(resultPhrase, maxProgramsToGet);

  async function showMoreResults() {
    let showing = resultShowedNumber(resultPhrase);
    let clicks = 0;
    let errors = 0;
    let firstError = false;

    while (showing < maxProgramsToGet && showing < numberOfResults) {
      let resultPhrase;
      try {
        resultPhrase = await page.evaluate(() => document.querySelector('.title-count').textContent);
        await page.waitForSelector('.next-page-button')
          .then(async () => { await page.click('.next-page-button'); })
          .then(() => {
            firstError = false;
            clicks += 1;
            console.log('\x1b[30m','-------------------------------------------'); // eslint-disable-line
            console.log(`Clicks: ${clicks}`); // eslint-disable-line
            console.log(`Showing: ${showing} of ${numberOfResults}, adding resuts.`); // eslint-disable-line
            console.log('-------------------------------------------','\x1b[0m'); // eslint-disable-line
          });
      } catch (error) {
        firstError = true;
        errors += 1;
        console.log('\x1b[30m',`Errors: ${errors}`,'\x1b[0m'); // eslint-disable-line
      } finally {
        await new Promise((r) => setTimeout(r, firstError ? 700 : 150));
        showing = resultShowedNumber(resultPhrase);
      }
    }
    console.log(`Showing: ${showing} of ${numberOfResults}.`); // eslint-disable-line
    console.log('Grabbing Array'); // eslint-disable-line
    console.log('-------------------------------------------'); // eslint-disable-line
  }

  async function grabArray() {
    return page.evaluate((maxProgramsToGet) => {
      const hasMaxProgramsToGet = !!(typeof (maxProgramsToGet) === 'number' && maxProgramsToGet !== 0);
      let anchors = Array.from(document.querySelectorAll('#productsList h2 > a'));
      if (hasMaxProgramsToGet && typeof (maxProgramsToGet) === 'number') {
        anchors = anchors.slice(0, maxProgramsToGet);
      }
      return anchors.map((anchor) => {
        const title = anchor.textContent;
        return {
          title,
          url: anchor.href,
        };
      });
    }, maxProgramsToGet);
  }

  if (!isTest) { await showMoreResults(); }

  const results = await grabArray();

  await browser.close();

  return results;
}
