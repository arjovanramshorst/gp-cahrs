import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
import {sortIdx, takeTopNIdx} from "../utils/sort.utils";
import * as math from "mathjs";

export interface NNConfig {
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
    // Number of neighbours to consider (number of rows / 20 is max, chosen experimentally)
    N: Math.floor(Math.random() * (output.rows / 20) + 2)
  }),
  evaluate: (config: NNConfig, [similarity, scores]: [number[][], number[][]]) => {
    const [rows, cols] = [scores.length, scores[0].length]
    let res: number[][] = math.zeros([rows, cols]) as number[][]
    // For each row in similarity
    for (let idxRow = 0; idxRow < rows; idxRow++) {
      const similarUserScores = similarity[idxRow]
      // For N nearest rows (sort idx in rows)
      const similarUserIdxs = sortIdx(similarUserScores).slice(0, config.N)
      for (let idxCol = 0; idxCol < cols; idxCol++) {
        res[idxRow][idxCol] = similarUserIdxs
          .reduce((sum, userIdx) => {
              return sum + (similarUserScores[userIdx] * scores[userIdx][idxCol])
            },
            0
          ) / similarUserIdxs.length
      }
    }

    return res
  }
}

// TODO: Verify if this works!
export const InvertedNNRecommendFunction: FunctionImplementation<NNConfig> = {
  type: "nearestNeighbour(inverted)",
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
    if (input[1].rows !== input[0].columns) {
      // input[1] should have the same amount of columns as input[0] has rows/columns
      return undefined
    }

    // TODO: THIS APPEARS TO BE INCORRECT!!!!
    // Returns input[1] if valid
    return input[1] as DTOMatrix
  },
  specifyInput: (output: DTOMatrix, input: DTOMatrix[]): [DTOMatrix, DTOMatrix] => {
    // TODO: OR THIS!!!!
    return [{
      dtoType: DTOType.matrix,
      fromEntity: output.toEntity,
      toEntity: output.toEntity,
      rows: output.columns,
      columns: output.columns,
    }, {
      ...output
    }]
  },
  createConfig: (output: DTOMatrix) => ({
    // Number of neighbours to consider
    N: Math.floor(Math.random() * (output.rows / 20) + 2)
  }),
  evaluate: (config: NNConfig, [similarity, scores]: [number[][], number[][]]) => {
    const [rows, cols] = [scores.length, scores[0].length]
    let res: number[][] = math.zeros([rows, cols]) as number[][]

    // find N similar entityIdx given similarity:
    const similarIdx: number[][] = []
    for (let idxRow = 0; idxRow < similarity.length; idxRow++) {
      const row = similarity[idxRow]
      similarIdx.push(takeTopNIdx(row, config.N))
    }

    // For each row in similarity
    for (let idxRow = 0; idxRow < rows; idxRow++) {
      const fromScores = scores[idxRow]

      // For N highest recommended nearest columns (sort idx in row) (take N instead)
      for (let idxCol = 0; idxCol < cols; idxCol++) {
        const scoreToCompare = fromScores[idxCol]
        if (scoreToCompare > 0) {
          const similarCols = similarIdx[idxCol]
          similarCols.forEach(similarCol => {
            const similarityScore = similarity[idxCol][similarCol]
            res[idxRow][similarCol] += similarityScore * scoreToCompare
          })
        }
      }
    }

    return res
  }
}

export const CFFunctions = [
  NNRecommendFunction,
  InvertedNNRecommendFunction
]