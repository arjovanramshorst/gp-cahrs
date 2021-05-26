import { ProblemInstance } from "./interface/problem.interface";
import {calcFunction} from "./functions/function";
import { calcTerminal } from "./terminals/terminal";
import {ConfigTree} from "./tree";
import {printNested} from "./utils/display.utils";
import {readCache, writeCache} from "./utils/cache.utils";

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
  depth: number = 0
  // output: DTO
) => {
  const cache = readCache(problemInstance, configFinger)
  if (cache) {
    return cache
  }
  printNested(depth, `Entered ${configFinger.config.type}, config: ${configFinger.config}`);
  let input;
  if (isFunction(configFinger)) {
    input = [];
    // const specificInputDTO = specifyInputDto(configFinger.config, output, configFinger.input.map(it => it.output))

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

  printNested(depth, `Calculating ${configFinger.config.type}, config: ${JSON.stringify(configFinger.config)}`);
  const res = calc(configFinger, input, problemInstance);
  printNested(depth, `Finished ${configFinger.config.type}`);
  writeCache(problemInstance, configFinger, res)
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
    return calcTerminal(config.config, problemInstance, config.output);
  }
};


const isFunction = (config: ConfigTree) => config.input.length > 0
const isTerminal = (config: ConfigTree) => !isFunction(config)