import { FunctionImplementation } from "./function";
import {
  DTO,
  DTOType,
  DTOVector,
  findMatchingType,
} from "./../interface/dto.interface";
import { Matrix } from "../interface/util.interface";
import { NodeFunction } from "./../interface/node.interface";
import { PropertyType } from "../interface/problem.interface";

export type MatrixMathConfig = {};

type MatrixMathFunction = NodeFunction<
  MatrixMathConfig,
  [Matrix<number>, Matrix<number>],
  Matrix<number>
>;

export const mathMatrixOutput = (input: DTO[]) => {
  const [left, right] = input;
  if (invalidVector(left) || invalidVector(right)) {
    return undefined
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

const invalidVector = (vector: DTO) => {
  if (vector.dtoType === DTOType.vector && (vector as DTOVector).valueType !== PropertyType.number) {
    // Vector is invalid
    return true
  }

  // Not a vector, or a number
  return false
}

export const MultiplyFunction: FunctionImplementation = {
  type: "multiply",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: (input) => multiplyMatrix({}, [input[0], input[1]]),
};

export const SumFunction: FunctionImplementation = {
  type: "sum",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: (input) => sumMatrix({}, [input[0], input[1]]),
}

export const multiplyMatrix: MatrixMathFunction = (config, [a, b]) => {
  // TODO: handle scalars
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      a[i][j] *= b[i][j];
    }
  }
  // force GC?
  b = [];
  return a;
};

export const sumMatrix: MatrixMathFunction = (config, [a, b]) => {
  // TODO: handle scalars
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      a[i][j] += b[i][j];
    }
  }
  // force GC?
  b = [];
  return a;
};
