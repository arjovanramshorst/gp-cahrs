import {CONFIG} from "../default.config";

export const printNested = (depth: number, str: string) => {
  const prefix = [...Array(depth)].map((it) => "  ").join("");

  if (CONFIG.DEBUG_MODE) {
    console.log(`${prefix}${str}`);
  }
};
