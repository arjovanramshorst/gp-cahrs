
// @ts-ignore workers work anyway
import {calcRecursive, config} from "./quick-tests.ts";

self.onmessage = async (msg) => {
  console.log("Worker starts");
  calcRecursive(config)

  console.log("Worker is finished");
  self.close();
};
