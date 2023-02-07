import puppeteer from 'puppeteer';

// https://www.viator.com/es-ES/tours/Buenos-Aires/Tango-Porteo-Tango-Show-with-Optional-Dinner-and-Tango-Class-in-Buenos-Aires/d901-5674P91

import fs from 'fs';
import { title } from 'process';

async function obtainDetails(URL) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(URL);

	grabData();
	async function grabData() {
		let programData = {};
		// const programData = await page.evaluate (() => {
		await page.evaluate(() => {
			programData.id = 0;
			programData = {
				// "id": 0,
				name: document.querySelector('h1').textContent,
				duration: 4,
				offeredIn: ['spanish', 'english'],
				overview:
					"Experience the passion of an authentic Argentine tango with a spectacular evening show at the glamorous Tango Porteño, including hotel transfers. First, put on your dancing shoes for a tango class and learn some of the famous steps. Then, if you've opted to, enjoy a delicious gourmet meal accompanied by a variety of wines. Finally, prepare to be dazzled as the world-class dancers take to the stage, dressed in elaborate costumes and accompanied by a live band, evoking the magic of the golden era of tango.",
				overviewTags: [
					'Take part in a traditional Argentine Tango class at Tango Porteño',
					'Enjoy a live show featuring over 40 artists and musicians',
					'Opt to include a gourmet meal of Argentine steak, a variety of wines, and dessert',
					'Round-trip hotel transfers included for an added convenience',
				],
			};
			programData.programData.programData.programData.document.querySelector('.title-count')
				.textContent;
		});

		grabArray();

		////////////////// Recoger array de {title, url}
		async function grabArray() {
			results = await page.evaluate(() => {
				const anchors = Array.from(document.querySelectorAll('#productsList h2 > a'));
				return anchors.map((anchor) => {
					const title = anchor.textContent;
					return {
						title,
						url: anchor.href,
					};
				});
			});

			await browser.close();
			fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
			console.log(results);
			console.log(results.length);
			fs.writeFileSync('data/viatorTangoResults.json', JSON.stringify(results, null, 2));
		}
	}
}

searchViator('tango');
