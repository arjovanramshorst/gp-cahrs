import { zeros } from "mathjs";
import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType, DTOVector} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";

const PopularityFunction: FunctionImplementation<{}> = {
  type: "popularity",
  inputSize: 1,
  getOutput: ([input]) => {
    if (input.dtoType !== DTOType.matrix) {
      return undefined
    }
    return {
      dtoType: DTOType.vector,
      entity: input.fromEntity,
      items: input.columns,
      valueType: PropertyType.number
    } as DTOVector
  },
  specifyInput: (output: DTOVector, input: DTOMatrix[]) => {
    return [{
      dtoType: DTOType.matrix,
      rows: input[0].rows,
      fromEntity: input[0].fromEntity,
      columns: output.items,
      toEntity: output.entity,
    }] as DTOMatrix[]
  },
  evaluate: (config, input) => {
    const res = zeros(input[0].length) as number[]
    for (let rowIdx = 0; rowIdx < input.length; rowIdx++) {
      for (let colIdx = 0; colIdx < input[0].length; colIdx++) {
        res[colIdx] += input[0][rowIdx][colIdx]
      }
    }

    for (let colIdx = 0; colIdx < res.length; colIdx++) {
      // TODO: Replace with normalization?
      res[colIdx] /= input.length
    }

    return res
  },
};

export const PopularityFunctions = [
  PopularityFunction
]