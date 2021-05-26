import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType, sameOrUndefined} from "../interface/dto.interface";
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

    const [similarity, relevancy] = input

    if (!similarity.fromEntity || !similarity.toEntity || !relevancy.toEntity || !relevancy.fromEntity) {
      return undefined
    }

    if (!sameOrUndefined(similarity.fromEntity, similarity.toEntity)) {
      // input[0] should be square
      return undefined
    }
    if (!sameOrUndefined(relevancy.fromEntity, similarity.fromEntity)) {
      // input[1] should have the same amount of rows as input[0] has rows/columns
      return undefined
    }
    if (relevancy.toEntity === relevancy.fromEntity) {
      // TODO: Test is this is okay?
      return undefined
    }

    return {
      ...relevancy,
      fromEntity: similarity.fromEntity ?? similarity.toEntity ?? relevancy.fromEntity,
    }
  },
  specifyInput: (output: DTOMatrix, input: DTOMatrix[]): [DTOMatrix, DTOMatrix] => {
    return [{
      dtoType: DTOType.matrix,
      fromEntity: output.fromEntity,
      toEntity: output.fromEntity,
    }, {
      ...output
    }]
  },
  createConfig: (output: DTOMatrix) => ({
    // Number of neighbours to consider (number of rows / 20 is max, chosen experimentally)
    // TODO: N: Math.floor(Math.random() * (output.rows / 20) + 2)
    N: Math.floor(Math.random() * (20) + 2)
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
    const [itemSimilarity, relevancy]: DTOMatrix[] = input

    if (!itemSimilarity.fromEntity || !itemSimilarity.toEntity || !relevancy.toEntity || !relevancy.fromEntity) {
      return undefined
    }

    if (!sameOrUndefined(itemSimilarity.fromEntity, itemSimilarity.toEntity)) {
      // input[0] should be square
      return undefined
    }
    if (!sameOrUndefined(itemSimilarity.fromEntity, relevancy.toEntity)) {
      // input[1] should have the same amount of columns as input[0] has rows/columns
      return undefined
    }
    if (relevancy.toEntity === relevancy.fromEntity) {
      // TEST
      return undefined
    }

    return {
      ...relevancy,
      toEntity: itemSimilarity.fromEntity ?? itemSimilarity.toEntity ?? relevancy.toEntity
    }
  },
  specifyInput: (output: DTOMatrix, input: DTOMatrix[]): [DTOMatrix, DTOMatrix] => {
    // TODO: OR THIS!!!!
    return [{
      dtoType: DTOType.matrix,
      fromEntity: output.toEntity,
      toEntity: output.toEntity,
    }, {
      ...output
    }]
  },
  createConfig: (output: DTOMatrix) => ({
    // Number of neighbours to consider
    // TODO: N: Math.floor(Math.random() * (output.rows / 20) + 2)
    N: Math.floor(Math.random() * (20) + 2)
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