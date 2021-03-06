import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
import {zeros} from "mathjs";

export const PearsonSimilarityFunction: FunctionImplementation<{}> = {
  type: "pearsonSimilarity",
  inputSize: 1,
  getOutput: (input) => {
    // TOOD: Only allow this for root model?
    if (input[0].dtoType !== DTOType.matrix) {
      return undefined
    }

    const inputMatrix = input[0] as DTOMatrix

    if ((inputMatrix.fromEntity || inputMatrix.toEntity) && inputMatrix.fromEntity === inputMatrix.toEntity) {
      // This only works on interactions between different entities, so we can ignore inputs where from/to is the same
      return undefined
    }

    return {
      dtoType: DTOType.matrix,
      fromEntity: inputMatrix.fromEntity,
      toEntity: inputMatrix.fromEntity,
    }
  },
  specifyInput: (output: DTOMatrix, input: [DTOMatrix]): [DTOMatrix] => {
    return [{
      dtoType: DTOType.matrix,
      fromEntity: output.fromEntity,
      toEntity: input[0].toEntity,
    }]
  },
  evaluate: (config, [scores]) => {
    const [rows, cols] = [scores.length, scores[0].length]
    const res: any = zeros([rows, rows])
    for (let idxR1 = 0; idxR1 < rows - 1; idxR1++) {
      const row1 = scores[idxR1]
      for (let idxR2 = idxR1; idxR2 < rows; idxR2++) {
        const similarity = pearsonCorrelation(row1, scores[idxR2])
        res[idxR1][idxR2] = similarity
        res[idxR2][idxR1] = similarity
      }
    }
    return res
  },
};

/**
 * From https://gist.github.com/matt-west/6500993#gistcomment-2743187
 * @param d1
 * @param d2
 */
export const pearsonCorrelation = (d1: any, d2: any) => {
  let { min, pow, sqrt } = Math
  let add = (a, b) => a + b
  let n = min(d1.length, d2.length)
  if (n === 0) {
    return 0
  }
  [d1, d2] = [d1.slice(0, n), d2.slice(0, n)]
  let [sum1, sum2] = [d1, d2].map(l => l.reduce(add))
  let [pow1, pow2] = [d1, d2].map(l => l.reduce((a, b) => a + pow(b, 2), 0))
  let mulSum = d1.map((n, i) => n * d2[i]).reduce(add)
  let dense = sqrt((pow1 - pow(sum1, 2) / n) * (pow2 - pow(sum2, 2) / n))
  if (dense === 0) {
    return 0
  }
  return (mulSum - (sum1 * sum2 / n)) / dense
}

export const SimilarityFunctions = [
  PearsonSimilarityFunction
]