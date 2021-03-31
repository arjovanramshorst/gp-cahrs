import { ProblemInstance } from "./interface/problem.interface";
import { calcFunction, isFunction } from "./functions/function";
import { FunctionConfigs, PossibleConfigs } from "./interface/config.interface";
import { calcTerminal, isTerminal } from "./terminals/terminal";

let COUNT = 0

export const addCount = () => {
    console.log(`Adding matrix, total: ${COUNT++}`)
}

export const subCount = () => {
    console.log(`removing matrix, total: ${COUNT--}`)
}

export const calcRecursive = (
  config: PossibleConfigs,
  problemInstance: ProblemInstance,
  depth: number = 0,
) => {
  print(depth, `Entered ${config.type}, config: ${config.config}`);
  let input;
  if (isFunction(config)) {
    input = [];

    (config as FunctionConfigs).input.forEach((inputConfig, idx) => {
      if (isFunction(inputConfig)) {
        input[idx] = calcRecursive(inputConfig, problemInstance, depth + 1);
      }
    });
    // Only calculate terminals after functions are done (memory related reasons)
    (config as FunctionConfigs).input.forEach((inputConfig, idx) => {
      if (isTerminal(inputConfig)) {
        input[idx] = calcRecursive(inputConfig, problemInstance, depth + 1);
      }
    });
  }
  // Depth first, so first calculate functions

  print(depth, `Calculating ${config.type}, config: ${config.config}`);
  const res = calc(config, input, problemInstance);
  print(depth, `Finished ${config.type}, config: ${config.config}`);
  return res;
};


const calc = (
  config: PossibleConfigs,
  input: any,
  problemInstance: ProblemInstance,
) => {
  if (isFunction(config)) {
    return calcFunction(config, input);
  } else if (isTerminal(config)) {
    return calcTerminal(config, problemInstance);
  }
  throw Error("invalid config");
};

const print = (depth: number, str: string) => {
  const prefix = [...Array(depth)].map((it) => "  ").join("");

  console.log(`${prefix}${str}`);
};
