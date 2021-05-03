import {add, dotMultiply, subtract} from "mathjs"
import {FunctionImplementation} from "./function";
import {DTO, DTOMatrix, DTOType, DTOVector, findMatchingType, sameOrUndefined,} from "../interface/dto.interface";
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
  if (
    left.dtoType === DTOType.vector && right.dtoType === DTOType.matrix
    && sameOrUndefined(left.items, right.columns) && sameOrUndefined(left.entity, right.toEntity)
  ) {
    return right
  }

  if (
    right.dtoType === DTOType.vector && left.dtoType === DTOType.matrix
    && sameOrUndefined(right.items, left.columns) && sameOrUndefined(right.entity, left.toEntity)
  ) {
    return left
  }
  return undefined;
};

export const mathMatrixInput = (output: DTO, input: DTO[]): DTO[] => {
  if (output.dtoType === DTOType.matrix && input[0].dtoType === DTOType.matrix && input[1].dtoType === DTOType.matrix) {

    // Make sure that if output is not completely defined, inputs MUST be same size (
    const [left, right] = input as DTOMatrix[]
    // Set a default size? Maybe make this random?
    const defaultSize = 1

    const rows = output.rows || left.rows || right.rows || defaultSize
    const columns = output.columns || left.columns || right.columns || defaultSize

    return [{
      ...output,
      ...left,
      rows,
      columns
    }, {
      ...output,
      ...right,
      rows,
      columns
    }]
  }

  const specific = input.map((it) => {
    if (it.dtoType === DTOType.matrix) {
      return output;
    }
    if (it.dtoType === DTOType.vector && output.dtoType === DTOType.vector) {
      return output;
    }

    if (it.dtoType === DTOType.vector && output.dtoType === DTOType.matrix) {
      return {
        ...it,
        items: (output as DTOMatrix).columns,
        entity: (output as DTOMatrix).toEntity,
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

const handleWithVectors = (func) => (config, input) => {
  const matrixes = input.filter(it => Array.isArray(it) && Array.isArray(it[0]))
  const vectors = input.filter(it => Array.isArray(it) && !Array.isArray(it[0]))
  if (matrixes.length === 1 && vectors.length === 1) {
    const matrix = matrixes[0]
    const vector = vectors[0]
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = func(vector, matrix[i])
    }
    return matrix
  } else {
    return func(input[0], input[1])
  }
}

const MultiplyFunction: FunctionImplementation<{}> = {
  type: "multiply",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: handleWithVectors((left, right) => dotMultiply(left, right)),
  specifyInput: mathMatrixInput,
};

const SumFunction: FunctionImplementation<{}> = {
  type: "sum",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: handleWithVectors((left, right) => add(left, right)),
  specifyInput: mathMatrixInput,
};

const SubtractFunction: FunctionImplementation<{}> = {
  type: "subtract",
  inputSize: 2,
  getOutput: mathMatrixOutput,
  evaluate: handleWithVectors((left, right) => subtract(left, right)),
  specifyInput: mathMatrixInput,
};

const AddVector: FunctionImplementation<{}> = {
  type: "addVector",
  inputSize: 2,
  getOutput: ([matrix, vector]: DTO[]) => {
    if (matrix.dtoType === DTOType.matrix && vector.dtoType === DTOType.vector) {
      if (matrix.columns === vector.items) {
        return matrix
      }
    }

    return undefined
  },
  evaluate: handleWithVectors((left, right) => add(left, right)),
  specifyInput: (output: DTOMatrix, input: DTO[]) => {
    return [
      output,
      {
        dtoType: DTOType.vector,
        items: output.columns,
        entity: output.toEntity,
        valueType: PropertyType.number
      }] as DTO[]
  }
}

// TODO: Add MultiplyScalar here, remove multiply/sum

export const MathFunctions = [
  MultiplyFunction,
  // SumFunction,
  AddVector
  // SubtractFunction
];
