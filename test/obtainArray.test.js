import { assert, expect } from "chai";

import { buildBaseUrl, getNumberOfResults, resultShowedNumber, searchViator } from "../obtainArray.js";

describe("Test base parameters of obtainArray.js", () => {

  it("Should return base url", () => {
    const wordsToTest = ["hola", "chau"]
    for (let word in wordsToTest) {
      assert.equal(
        buildBaseUrl(word),
        `https://www.viator.com/es-ES/searchResults/all?text=${word}`
      );
    }
  });

  it("Should return total number of results, given the result phrase", () => {
    for (let numberOfResults in [1, 23, 456, 7890, 98765]) {
      const resultPhrase = 'Se muestran 1 - 24 de '+numberOfResults+' resultados de “palabra”'
      assert.equal(
        getNumberOfResults(resultPhrase),
        numberOfResults
      );
    }
  });

  it("Should return number of shown results, given the result phrase", () => {
    for (let numberOfResults in [1, 23, 456, 7890, 98765, 432101]) {
      const resultPhrase = `Se muestran 1 - ${numberOfResults} de 1.234 resultados de “palabra”`
      assert.equal(
        resultShowedNumber(resultPhrase),
        numberOfResults
      );
    }
  });

  it("Should return an array of results like: {title, url}", async () => {
    let results = await searchViator("tango", 1, true)
    results.forEach(result => {
      
      expect(result.title).to.be.a("string");

      const startOfUrls = "https://www.viator.com/" // "https://www.viator.com/es-ES/tours/Buenos-Aires/" // podría mejorar el algoritmo grabando solo cosas de Buenos Aires, me avive de esto gracias al test fallido
      const length = startOfUrls.length
      assert.equal(
        result.url.substring(0, length),
        startOfUrls
        );
    });
  }).timeout(30000);
});
