import { ProblemInstance } from "./interface/problem.interface";
import { calcFunction } from "./functions/function";
import { calcTerminal } from "./terminals/terminal";
import {ConfigTree} from "./tree";

let COUNT = 0

export const addCount = () => {
    console.log(`Adding matrix, total: ${COUNT++}`)
}

export const subCount = () => {
    console.log(`removing matrix, total: ${COUNT--}`)
}

export const calcRecursive = (
  configFinger: ConfigTree,
  problemInstance: ProblemInstance,
  depth: number = 0,
) => {
  print(depth, `Entered ${configFinger.config.type}, config: ${configFinger.config}`);
  let input;
  if (isFunction(configFinger)) {
    input = [];

    configFinger.input.forEach((inputConfig, idx) => {
      if (isFunction(inputConfig)) {
        input[idx] = calcRecursive(inputConfig, problemInstance, depth + 1);
      }
    });
    // Only calculate terminals after functions are done (memory related reasons)
    configFinger.input.forEach((inputConfig, idx) => {
      if (isTerminal(inputConfig)) {
        input[idx] = calcRecursive(inputConfig, problemInstance, depth + 1);
      }
    });
  }
  // Depth first, so first calculate functions

  print(depth, `Calculating ${configFinger.config.type}, config: ${JSON.stringify(configFinger.config)}`);
  const res = calc(configFinger, input, problemInstance);
  print(depth, `Finished ${configFinger.config.type}`);
  return res;
};


const calc = (
  config: ConfigTree,
  input: any,
  problemInstance: ProblemInstance,
) => {
  if (isFunction(config)) {
    return calcFunction(config.config, input);
  } else {
    return calcTerminal(config.config, problemInstance);
  }
};

const print = (depth: number, str: string) => {
  const prefix = [...Array(depth)].map((it) => "  ").join("");

  console.log(`${prefix}${str}`);
};

const isFunction = (config: ConfigTree) => config.input.length > 0
const isTerminal = (config: ConfigTree) => !isFunction(config)