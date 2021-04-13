import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
// @ts-ignore
import {zeros, row, size, sum,dotPow, dotMultiply} from "mathjs";
import {matrixSet, matrixSize, vectorSize} from "../utils/matrix.utils";

const PearsonSimilarityFunction: FunctionImplementation = {
  type: "pearsonSimilarity",
  inputSize: 1,
  getOutput: (input) => {
    if (input[0].dtoType !== DTOType.matrix) {
      return undefined
    }

    const inputMatrix = input[0] as DTOMatrix

    return {
      dtoType: DTOType.matrix,
      fromEntity: inputMatrix.fromEntity,
      toEntity: inputMatrix.fromEntity,
      rows: inputMatrix.rows,
      columns: inputMatrix.rows
    }
  },
  specifyInput: (output: DTOMatrix, input) => {
    return [{
      dtoType: DTOType.matrix,
      fromEntity: output.fromEntity,
      rows: output.rows,
    }]
  },
  evaluate: (config, input) => {
    const [rows, cols] = matrixSize(input[0])
    let res: any = zeros(matrixSize(input[0]))
    for (let r1 = 0; r1 < rows - 1; r1++) {
      console.log(`row #${r1} / ${rows}`)
      for (let r2 = r1 + 1; r2 < rows; r2++) {
        const similarity = corr(row(input[0], r1), row(input[0], r2))
        res[r1][r2] = similarity
        res[r2][r1] = similarity
      }
    }
    return res
  },
};

/**
 * Based on the following gist: https://gist.github.com/matt-west/6500993#gistcomment-2743187
 * @param d1
 * @param d2
 */
const corr = (d1: any, d2: any) => {
  let {min, pow, sqrt} = Math
  let n = min(vectorSize(d1), vectorSize(d2))
  if (n === 0) {
    return 0
  }

  let [sum1, sum2] = [sum(d1), sum(d2)]
  // @ts-ignore
  let [pow1, pow2] = [sum(dotPow(d1, 2)), sum(dotPow(d2, 2))]

  // @ts-ignore
  let mulSum = sum(dotMultiply(d1, d2))

  let dense = sqrt((pow1 - pow(sum1, 2) / n) * (pow2 - pow(sum2, 2) / n))
  if (dense === 0) {
    return 0
  }
  return (mulSum - (sum1 * sum2 / n)) / dense
}

export const SimilarityFunctions = [
  PearsonSimilarityFunction
]