import { NodeImplementation } from "./interface/node.interface";
import { FunctionImplementation } from "./functions/function";
import { DTO, findMatchingType } from "./interface/dto.interface";
import { TerminalImplementation } from "./terminals/terminal";
import { inputCombinations } from "./utils/functional.utils";
import { selectRandom } from "./utils/random.utils";
import { CONFIG } from "./default.config";

type TreeTable = DTO[][];

export const generateTree = (
  outputDTO: DTO,
  treeTable: TreeTable,
  terminals: TerminalImplementation[],
  functions: FunctionImplementation[],
  maxDepth: number,
  grow: boolean = false
): ConfigTree => {
  const validTerminals = terminals.filter((it) =>
    findMatchingType(outputDTO, it.getOutput())
  );
  const validFunctions = functions
    .map((it) => {
      const possibleInput = inputCombinations(
        treeTable[maxDepth - 1],
        it.inputSize
      )
        .filter((input) => findMatchingType(outputDTO, it.getOutput(input)))
        .map((input) => it.specifyInput(outputDTO, input));
      return {
        function: it,
        possibleInput,
      };
    })
    .filter((it) => it.possibleInput.length > 0);

  let selected: NodeImplementation;
  let input = [];
  if (maxDepth === 1) {
    selected = selectRandom(validTerminals);
  } else if (grow) {
    if (Math.random() > CONFIG.GROWTH_FUNCTION_FRACTION) {
      const randomFunction = selectRandom(validFunctions);
      selected = randomFunction.function;
      input = selectRandom(randomFunction.possibleInput);
    } else {
      selected = selectRandom(validTerminals);
    }
  } else {
    const randomFunction = selectRandom(validFunctions);
    selected = randomFunction.function;
    input = selectRandom(randomFunction.possibleInput);
  }
  const config = {
    type: selected.type,
    ...(selected.createConfig ? selected.createConfig() : {}),
  };

  return {
    config,
    output: outputDTO,
    input: input.map((input) =>
      generateTree(input, treeTable, terminals, functions, maxDepth - 1, grow)
    ),
  };
};

interface ConfigTree {
  config: Config;
  output: DTO;
  input: ConfigTree[];
}

interface Config {
  type: string;
}

export const generateTreeTables = (
  terminals: TerminalImplementation[],
  functions: FunctionImplementation[],
  maxDepth = 5,
  grow = false
): TreeTable => {
  const treeTable: DTO[][] = [[]];
  terminals.forEach((it) => {
    if (treeTable[0].every((existing) => !isSame(existing, it))) {
      treeTable[0].push(it.getOutput());
    }
  });

  for (let i = 1; i < maxDepth; i++) {
    treeTable.push([]);
    if (grow) {
      treeTable[i] = [].concat(treeTable[i - 1]);
    }

    // For every function
    functions.forEach((f) => {
      // Handle for every input combination given the input size
      inputCombinations(treeTable[i - 1], f.inputSize).forEach((input) => {
        const output = f.getOutput(input);
        if (output && treeTable[i].every((it) => !isSame(it, output))) {
          treeTable[i].push(output);
        }
      });
    });
  }
  return treeTable;
};

const isSame = (left, right) =>
  Object.keys(left).every((key) => right[key] && right[key] === left[key]) &&
  Object.keys(right).every((key) => left[key] && left[key] === right[key]);
