import {add, dotMultiply, multiply, subtract} from "mathjs"
import {FunctionImplementation} from "./function";
import {DTO, DTOMatrix, DTOType, DTOVector, findMatchingType, sameOrUndefined,} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";
import {CONFIG} from "../config";

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
    && sameOrUndefined(left.entity, right.toEntity)
  ) {
    return right
  }

  if (
    right.dtoType === DTOType.vector && left.dtoType === DTOType.matrix
    && sameOrUndefined(right.entity, left.toEntity)
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

    return [{
      ...output,
      ...left,
    }, {
      ...output,
      ...right,
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

const ProductMatrix: FunctionImplementation<{}> = {
  type: "productMatrix",
  inputSize: 2,
  getOutput: ([left, right]: DTO[]) => {
    if (left.dtoType === DTOType.matrix && right.dtoType === DTOType.matrix) {
      if (left.toEntity && right.fromEntity && left.toEntity == right.fromEntity) {
        return {
          dtoType: DTOType.matrix,
          fromEntity: left.fromEntity,
          toEntity: right.toEntity
        }
      }
    }
    return undefined
  },
  evaluate: (config, [left, right]) => multiply(left, right),
  specifyInput: (output: DTOMatrix, [left, right]: DTOMatrix[]) => {
    return [{
      ...left,
      fromEntity: left.fromEntity ?? output.fromEntity
    }, {
      ...right,
      toEntity: right.toEntity ?? output.toEntity
    }]
  }
}

const SumMatrix: FunctionImplementation<{ }> = {
  type: "sumMatrix",
  inputSize: 2,
  getOutput: ([left, right]: DTO[]) => {
    if (left.dtoType === DTOType.matrix && right.dtoType === DTOType.matrix) {
      return findMatchingType(left, right)
    }

    return undefined
  },
  evaluate: (config, [left, right]) => add(left, right),
  specifyInput: (output: DTOMatrix, input: DTO[]) => {
    return [
      output,
      output
    ] as DTO[]
  }
}

const AddVector: FunctionImplementation<{}> = {
  type: "addVector",
  inputSize: 2,
  getOutput: ([matrix, vector]: DTO[]) => {
    if (matrix.dtoType === DTOType.matrix && vector.dtoType === DTOType.vector && vector.valueType === PropertyType.number) {
      if (sameOrUndefined(matrix.toEntity, vector.entity)) {
        if (vector.entity) {
          return {
            ...matrix,
            toEntity: vector.entity
          }
        } else {
          return matrix
        }
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
        entity: output.toEntity,
        valueType: PropertyType.number
      }] as DTO[]
  }
}

const ScaleMatrix: FunctionImplementation<{ scale: number }> = {
  type: "scaleMatrix",
  inputSize: 1,
  getOutput: ([matrix]: DTO[]) => {
    if (matrix.dtoType === DTOType.matrix) {
      return matrix
    }

    return undefined
  },
  createConfig: (output) => ({
    scale: Math.floor(1 + Math.random() * CONFIG.NODES.SCALAR.MAX)
  }),
  evaluate: (config, input) => dotMultiply(config.scale, input[0]),
  specifyInput: (output: DTOMatrix, input: DTO[]) => {
    return [output] as DTO[]
  }
}

// TODO: Add MultiplyScalar here, remove multiply/sum

export const MathFunctions = [
  // MultiplyFunction,
  AddVector,
  ScaleMatrix,
  SumMatrix,
  // ProductMatrix
  // SumFunction,
  // SubtractFunction
];
