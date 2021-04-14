import {add, subtract, dotMultiply} from "mathjs"
import {FunctionImplementation} from "./function";
import {
  DTO,
  DTOMatrix,
  DTOType,
  DTOVector,
  findMatchingType,
} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";

export const mathMatrixOutput = (input: DTO[]) => {
  const [left, right] = input;
  if (invalidVector(left) || invalidVector(right)) {
    return undefined;
  }

  if (left.dtoType === DTOType.scalar) {
    return right;
  }
  if (right.dtoType === DTOType.scalar) {
    return left;
  }
  if (left.dtoType === right.dtoType) {
    return findMatchingType(left, right);
  }
  // TODO: Add support for vectors?

  return undefined;
};

export const mathMatrixInput = (output: DTO, input: DTO[]): DTO[] => {
  const specific = input.map((it) => {
    if (it.dtoType === DTOType.matrix) {
      return output;
    }
    if (it.dtoType === DTOType.vector && output.dtoType === DTOType.vector) {
      return output;
    }

    if (it.dtoType === DTOType.vector && output.dtoType === DTOType.matrix) {
      // TODO: add possibility for column vectors as well?
      return {
        ...it,
        items: (output as DTOMatrix).columns,
        entity: (output as DTOMatrix).fromEntity,
      } as DTO;
    }
    return it;
  });

  return specific
};

const invalidVector = (vector: DTO) => {
  if (
    vector.dtoType === DTOType.vector &&
    (vector as DTOVector).valueType !== PropertyType.number
  ) {
    // Vector is invalid
    return true;
  }

  // Not a vector, or a number
  return false;
};

const MultiplyFunction: FunctionImplementation<{}> = {
  type: "multiply",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: (config, input) => {
    return dotMultiply(input[0], input[1])
  },
  specifyInput: mathMatrixInput,
};

const SumFunction: FunctionImplementation<{}> = {
  type: "sum",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: (config, input) => {
    return add(input[0], input[1])
  },
  specifyInput: mathMatrixInput,
};

const SubtractFunction: FunctionImplementation<{}> = {
  type: "subtract",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: (config, input) => {
    return subtract(input[0], input[1])
  },
  specifyInput: mathMatrixInput,
};


export const MathFunctions = [MultiplyFunction, SumFunction, SubtractFunction];
