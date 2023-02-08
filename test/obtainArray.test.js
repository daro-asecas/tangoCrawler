import { assert } from "chai";
import { buildBaseUrl, puppeteerInit } from "../obtainArray.js";

describe("Test base parameters", () => {
  it.only("Should return base url", () => {
    const concatWords = ["hola", "chau"];

    for (let word in concatWords) {
      assert.equal(
        buildBaseUrl(word),
        `https://www.viator.com/es-ES/searchResults/all?text=${word}`
      );
    }
  });
});
