import {FunctionImplementation} from "./function";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
import {sortIdx} from "../utils/sort.utils";
import {NodeConfig} from "../tree";
import * as math from "mathjs";
import {matrixSet} from "../utils/matrix.utils";
import {Matrix} from "mathjs";

export interface NNConfig extends NodeConfig {
  output: DTOMatrix
  N: number
}

const NNRecommendFunction: FunctionImplementation = {
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
    return input[1]
  },
  specifyInput: (output: DTOMatrix, input: DTOMatrix[]) => {
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
  createConfig: (output) => ({
    // Number of neighbours to consider
    output,
    N: Math.floor(Math.random() * 10 + 2)
  }),
  evaluate: (config: NNConfig, [similarity, scores]) => {
    let res: any = math.zeros([config.output.rows, config.output.columns], "sparse")
    // For each row in similarity
    for(let row = 0; row < config.output.rows; row++) {
      // @ts-ignore
      const topIdx = sortIdx(math.row(similarity, row)).slice(0, config.N)
      // For N nearest rows (sort idx in rows)
      for (let col = 0; col < config.output.columns; col++) {
        const score = topIdx.reduce((sum, idx) => sum + similarity[idx] * scores[row][col], 0) / topIdx.length
        res = matrixSet(res, row, col, score)
      }
    }

    return res
  }
}

export const CFFunctions = [
  NNRecommendFunction
]