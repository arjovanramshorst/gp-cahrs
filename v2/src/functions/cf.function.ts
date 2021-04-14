import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
import {sortIdx} from "../utils/sort.utils";
import * as math from "mathjs";

export interface NNConfig {
  output: DTOMatrix
  N: number
}

export const NNRecommendFunction: FunctionImplementation<NNConfig> = {
  type: "nearestNeighbour",
  inputSize: 2,
  getOutput: (input: DTOMatrix[]) => {
    if (input[0].dtoType !== DTOType.matrix || input[1].dtoType !== DTOType.matrix) {
      // Both inputs should be matrices
      return undefined
    }
    if (input[0].rows !== input[0].columns) {
      // input[0] should be square
      return undefined
    }
    if (input[1].rows !== input[0].rows) {
      // input[1] should have the same amount of rows as input[0] has rows/columns
      return undefined
    }

    // Returns input[1] if valid
    return input[1] as DTOMatrix
  },
  specifyInput: (output: DTOMatrix, input: DTOMatrix[]): [DTOMatrix, DTOMatrix] => {
    return [{
      dtoType: DTOType.matrix,
      fromEntity: output.fromEntity,
      toEntity: output.fromEntity,
      rows: output.rows,
      columns: output.rows,
    }, {
      ...output
    }]
  },
  createConfig: (output: DTOMatrix) => ({
    // Number of neighbours to consider
    output,
    N: Math.floor(Math.random() * 10 + 2)
  }),
  evaluate: (config: NNConfig, [similarity, scores]: [number[][], number[][]]) => {
    const [rows, cols] = [scores.length, scores[0].length]
    let res: number[][] = math.zeros([rows, cols]) as number[][]
    // For each row in similarity
    for (let idxRow = 0; idxRow < rows; idxRow++) {
      console.log(`Row: #${idxRow}`)

      const similarUserScores = similarity[idxRow]
      // For N nearest rows (sort idx in rows)
      const similarUserIdxs = sortIdx(similarUserScores).slice(0, config.N)
      for (let idxCol = 0; idxCol < cols; idxCol++) {
        res[idxRow][idxCol] = similarUserIdxs
          .reduce((sum, userIdx) =>
            sum + similarUserScores[userIdx] * scores[idxRow][idxCol],
            0
          ) / similarUserIdxs.length
      }
    }

    return res
  }
}

export const CFFunctions = [
  NNRecommendFunction
]