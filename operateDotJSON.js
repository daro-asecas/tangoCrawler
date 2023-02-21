import fs from 'fs';

export async function saveInDotJSON(fileName, results) {
  fs.writeFileSync(fileName, JSON.stringify(results, null, 2));
}

export function getDataFromDotJSON(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) return reject(err);
      try {
        const json = JSON.parse(data);
        return resolve(json);
      } catch (E) {
        return reject(E);
      }
    });
  });
}
