import * as csvParser from "csv-parser";
import {CONFIG} from "../config";
const v8 = require("v8")

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

export const readFSCache = (filename: string) => {
  const path = `${CONFIG.CACHE_DIRECTORY}${filename}`
  if (fs.existsSync(path)) {
    console.log(`CACHE HIT: ${filename}`)
    return v8.deserialize(fs.readFileSync(path))
  }

  return null
}

export const writeFSCache = (filename: string, obj: any) => {
  const path = `${CONFIG.CACHE_DIRECTORY}${filename}`
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, v8.serialize(obj))
  }
}