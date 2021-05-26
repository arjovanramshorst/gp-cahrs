import {NodeImplementation} from "./interface/node.interface";
import {FunctionImplementation} from "./functions/function";
import {DTO, DTOType, findMatchingType} from "./interface/dto.interface";
import {TerminalImplementation} from "./terminals/terminal";
import {inputCombinations} from "./utils/functional.utils";
import {selectRandom} from "./utils/random.utils";
import {CONFIG} from "./config";
import {dtoToString, printNested} from "./utils/display.utils";

type TreeTable = DTO[][];

export interface ConfigTree {
  config: NodeConfig;
  output: DTO;
  input: ConfigTree[];
}

export interface NodeConfig {
  type: string;
}

export const  generateTree = (
  outputDTO: DTO,
  treeTable: TreeTable,
  terminals: TerminalImplementation<any>[],
  functions: FunctionImplementation<any>[],
  maxDepth: number,
  grow: boolean = false
): ConfigTree => {
  // Find terminals that possibly match OutputDTO
  const validTerminals = terminals.filter((it) =>

    findMatchingType(outputDTO, it.getOutput())
  );

  let selected: NodeImplementation<any>;
  let input: DTO[] = [];

  if (maxDepth === 1) {
    // Terminal is the only possibility
    selected = selectRandom(validTerminals);
  } else {
    // Find functions that possibly match OutputDTO
    const validFunctions = functions
      .map((it) => {
        // Find all valid combinations of inputs possbile for this function
        const possibleInput = inputCombinations(
          treeTable[maxDepth - 2],
          it.inputSize
        )
          // Make sure the types are matching for the output of this function given the random input combination
          .filter((input) => findMatchingType(outputDTO, it.getOutput(input)))
          // Map to detailed input configuration to get the required output
          .map((input) => it.specifyInput(outputDTO, input));
        return {
          function: it,
          possibleInput,
        };
      })
      // Filter functions that have no valid input configuration
      .filter((it) => it.possibleInput.length > 0);
    if (validTerminals.length + validFunctions.length === 0) {
      debugger
      throw Error("Should never happen")
    }

    if (grow) {
      if (validTerminals.length === 0 || (validFunctions.length > 0 && Math.random() < CONFIG.GROWTH_FUNCTION_FRACTION)) {
        const randomFunction = selectRandom(validFunctions);
        selected = randomFunction.function;
        input = selectRandom(randomFunction.possibleInput);
      } else {
        selected = selectRandom(validTerminals);
      }
    } else if (validFunctions.length > 0) {
      const randomFunction = selectRandom(validFunctions);
      selected = randomFunction.function;
      input = selectRandom(randomFunction.possibleInput);
    } else {
      debugger
    }
  }
  if (!selected) {
    debugger
  }
  const config = {
    type: selected.type,
    ...(selected.createConfig ? selected.createConfig(outputDTO) : {}),
  };
  printNested(CONFIG.MAX_DEPTH - maxDepth, `Picked: ${selected.type}, with input: ${input.map(it => dtoToString(it)).join(", ")}`)


  return {
    config,
    output: outputDTO,
    input: input.map((input) =>
      generateTree(input, treeTable, terminals, functions, maxDepth - 1, grow)
    ),
  };
};


export const generateTreeTables = (
  terminals: TerminalImplementation<any>[],
  functions: FunctionImplementation<any>[],
  maxDepth = 5,
  grow = false
): TreeTable => {
  const treeTable: DTO[][] = [[]];
  terminals.forEach((it) => {
    if (treeTable[0].every((existing) => !isSame(existing, it.getOutput()))) {
      treeTable[0].push(it.getOutput());
    }
  });

  for (let i = 1; i < maxDepth; i++) {
    treeTable.push([]);
    if (grow) {
      // Add previous level (since grow means everything from there is possible here as well)
      treeTable[i] = [...treeTable[i - 1]];
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

const isSame = (left: DTO, right: DTO) =>
  Object.keys(left).every((key) => (left[key] ?? undefined) === (right[key] ?? undefined)) &&
  Object.keys(right).every((key) => (left[key] ?? undefined) === (right[key] ?? undefined));

export const fun = (type: string, config: any = {}, input: ConfigTree[] = [], output: DTO = { dtoType: DTOType.matrix }): ConfigTree => ({
  config: {
    type,
    ...config
  },
  input: input,
  output
})

