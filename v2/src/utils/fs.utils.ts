import * as csvParser from "csv-parser";

const csv = require("csv-parser");
const fs = require("fs");

export const readCsvFile = <T>(filename: string, options: csvParser.Options = {}): Promise<T[]> => {
  return new Promise((resolve) => {
    const res: T[] = [];
    console.log(`Processing csv: ${filename}`)
    fs.createReadStream(filename)
      .pipe(csv(options))
      .on("data", (row: T) => {
        res.push(row);
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
        resolve(res)
      });
  });
};

export const appendFile = (filename: string, data: string) => {
  fs.appendFileSync(`./output/${filename}`, data)
}

export const writeFile = (filename: string, data: string) => {
  fs.writeFileSync(`./output/${filename}`, data)
}

export const readJson = (filename: string) => {
  return JSON.parse(fs.readFileSync(`./output/${filename}`).toString())
}