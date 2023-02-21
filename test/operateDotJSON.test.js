import { assert, expect } from 'chai';

import { getDataFromDotJSON } from '../operateDotJSON.js';

describe('Test base parameters of operateDotJSON.js', () => {
  it('Should return an array of results like: {title, url}', async () => {
    const testFile = './data/viatorTangoResults(5).json';
    const results = await getDataFromDotJSON(testFile);
    results.forEach((result) => {
      expect(result.title).to.be.a('string');

      const startOfUrls = 'https://www.viator.com/'; // "https://www.viator.com/es-ES/tours/Buenos-Aires/" // podría mejorar el algoritmo grabando solo cosas de Buenos Aires, me avive de esto gracias al test fallido
      const { length } = startOfUrls;
      assert.equal(
        result.url.substring(0, length),
        startOfUrls,
      );
    });
  });

  it('Should return an array of results like: {name, duration, overview, overviewTags, offeredIn, imgURLs}', async () => {
    const testFile = './data/viatorTangoDetails(5).json';
    const results = await getDataFromDotJSON(testFile, true);
    results.forEach((programData) => {
      expect(programData.name).to.be.a('string');
      expect(programData.duration).to.be.a('string');
      expect(programData.overview).to.be.a('string');
      expect(programData.overviewTags).to.be.a('array');
      expect(programData.offeredIn).to.be.a('array');
      expect(programData.imgURLs).to.be.a('array');
      // expect(programData.included).to.be.a("array");     // hay que hacer la funcion
      // expect(programData.notIncluded).to.be.a("array"); // hay que hacer la funcion
      expect(programData.realLink).to.be.a('string');

      programData.overviewTags.forEach((tag) => {
        expect(tag).to.be.a('string');
      });

      programData.offeredIn.forEach((language) => {
        expect(language).to.be.a('string');
      });

      // programData.included.forEach(feature => {
      //   expect(feature).to.be.a("string");
      // });

      // programData.notIncluded.forEach(feature => {
      //   expect(feature).to.be.a("string");
      // });

      const startOfImgSrc = 'https://media.tacdn.com/media/attractions-splice-spp-';
      const startOfImgSrcLength = startOfImgSrc.length;
      programData.imgURLs.forEach((URL) => {
        assert.equal(
          URL.substring(0, startOfImgSrcLength),
          startOfImgSrc,
        );
      });

      const startOfUrls = 'https://www.viator.com/';
      const startOfUrlsLength = startOfUrls.length;
      assert.equal(
        programData.realLink.substring(0, startOfUrlsLength),
        startOfUrls,
      );
    });
  });
});
