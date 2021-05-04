import { zeros } from "mathjs";
import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType, DTOVector} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";
import {filterUndefined} from "../utils/functional.utils";

const PopularityFunction: FunctionImplementation<{}> = {
  type: "popularity",
  inputSize: 1,
  getOutput: ([input]) => {
    // Popularity only works on defined matrices
    if (input.dtoType !== DTOType.matrix || !input.rows || !input.columns) {
      return undefined
    }
    return filterUndefined({
      dtoType: DTOType.vector,
      entity: input.toEntity,
      items: input.columns,
      valueType: PropertyType.number
    }) as DTOVector
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
  evaluate: (config, [input]) => {
    const res: number[] = zeros([input[0].length]) as number[]
    for (let rowIdx = 0; rowIdx < input.length; rowIdx++) {
      for (let colIdx = 0; colIdx < input[0].length; colIdx++) {
        const val = input[rowIdx][colIdx]
        res[colIdx] = (res[colIdx] ?? 0) + val
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