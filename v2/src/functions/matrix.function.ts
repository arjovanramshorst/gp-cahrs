import { zeros } from "mathjs"
import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType} from "../interface/dto.interface";

const TransposeFunction: FunctionImplementation<{}> = {
  type: "transpose",
  inputSize: 1,
  getOutput: ([input]) => {
    if (input.dtoType !== DTOType.matrix || input.fromEntity === input.toEntity) {
      return undefined
    }
    return {
      dtoType: DTOType.matrix,
      fromEntity: input.toEntity,
      toEntity: input.fromEntity,
    } as DTOMatrix
  },
  specifyInput: (output: DTOMatrix, input: DTOMatrix[]) => {
    return [{
      dtoType: DTOType.matrix,
      fromEntity: output.toEntity,
      toEntity: output.fromEntity,
    }] as DTOMatrix[]
  },
  evaluate: (config, [input]) => {
    const res: number[][] = zeros([input[0].length, input.length]) as number[][]
    for (let rowIdx = 0; rowIdx < input.length; rowIdx++) {
      for (let colIdx = 0; colIdx < input[0].length; colIdx++) {
        res[colIdx][rowIdx] = input[rowIdx][colIdx]
      }
    }

    return res
  },
};

export const MatrixFunctions = [
  TransposeFunction
]