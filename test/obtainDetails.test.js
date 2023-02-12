import { assert, expect } from "chai";

import { obtainDetailsOfOneProgram, obtainDetailsOfAllPrograms } from "../obtainDetails.js";

const URL = "https://www.viator.com/es-ES/tours/Buenos-Aires/Tango-Porteo-Tango-Show-with-Optional-Dinner-and-Tango-Class-in-Buenos-Aires/d901-5674P91"

describe("Test base parameters of obtainDetails.js", () => {

  it("Should return an array of results like: {name, duration, overview, overviewTags, offeredIn, imgURLs}", async () => {
    let programData = await obtainDetailsOfOneProgram(URL, 1, true)
    // results.forEach(result => {
      
      expect(programData.name).to.be.a("string");
      expect(programData.duration).to.be.a("string");
      expect(programData.overview).to.be.a("string");
      expect(programData.overviewTags).to.be.a("array");
      expect(programData.offeredIn).to.be.a("array");
      expect(programData.imgURLs).to.be.a("array");
      // expect(programData.included).to.be.a("array");     // hay que hacer la funcion
      // expect(programData.notIncluded).to.be.a("array"); // hay que hacer la funcion
      expect(programData.realLink).to.be.a("string");

      programData.overviewTags.forEach(tag => {
        expect(tag).to.be.a("string");
      });

      programData.offeredIn.forEach(language => {
        expect(language).to.be.a("string");
      });

      // programData.included.forEach(feature => {
      //   expect(feature).to.be.a("string");
      // });

      // programData.notIncluded.forEach(feature => {
      //   expect(feature).to.be.a("string");
      // });


      const startOfImgSrc = "https://media.tacdn.com/media/attractions-splice-spp-"
      const startOfImgSrcLength = startOfImgSrc.length
      programData.imgURLs.forEach(URL => {
        assert.equal(
          URL.substring(0, startOfImgSrcLength),
          startOfImgSrc
        );
      });

      const startOfUrls = "https://www.viator.com/"
      const startOfUrlsLength = startOfUrls.length
      assert.equal(
        URL.substring(0, startOfUrlsLength),
        startOfUrls
      );

    // }); // cierra el forEach comentado
  }).timeout(30000);

  it("Should respect maxProgramsToGet value", async () => {
    const resultsFile = "./data/viatorTangoResults.json"
    for (let number of [1, 2]) {
      let programData = await obtainDetailsOfAllPrograms(resultsFile, number)
      assert.equal(
        number,
        programData.length
        );
    }
  }).timeout(45000);
});