const csv = require("csv-parser");
const fs = require("fs");

export const readCsvFile = <T>(filename: string): Promise<T[]> => {
  return new Promise((resolve) => {
    const res: T[] = [];
    console.log(`Processing csv: ${filename}`)
    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (row) => {
        res.push(row as T);
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
        resolve(res)
      });
  });
};

export const appendFile = (filename: string, data: string) => {
  fs.appendFile(`./output/${filename}`, data, (err) => {
    if (err) throw err
    console.log(`appended to file: ${filename}`)
  })
}