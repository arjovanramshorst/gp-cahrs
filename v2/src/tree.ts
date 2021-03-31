import { FunctionImplementation } from "./functions/function";
import { DTO } from "./interface/dto.interface";
import { TerminalImplementation } from "./terminals/terminal";
import { inputCombinations } from "./utils/functional.utils";

type TreeTable = DTO[][];

export const generateTree = (treeTable: TreeTable) => {};

export const generateTreeTables = (
  terminals: TerminalImplementation[],
  functions: FunctionImplementation[],
  maxDepth = 5,
  grow = false,
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
