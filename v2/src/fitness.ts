import { ProblemInstance } from "./interface/problem.interface";

export interface FitnessValue {
  recall: number;
  precision: number;
  fScore: number;
  performance: number;
}

const RECOMMEND_SIZE = 10

export const fitnessScore = (output: number[][], problem: ProblemInstance): FitnessValue => {

  let avgRecall = 0;
  let avgPrecision = 0;

  for (let userIdx = 0; userIdx < output.length; userIdx++) {
    const topIdx = sortIdx(output[userIdx])
    const toFilter = problem.filter[userIdx]
    const toFind = problem.validate[userIdx]
    let total = 0;
    let found = 0;

    for (let i = 0; i < topIdx.length; i++) {
      if (toFilter.indexOf(topIdx[i]) === -1) {
        // Recommendation is not filtered
        total++
        if (toFind.indexOf(topIdx[i]) >= 0) {
        // Recommendation is "correct"
          found++
        }
      }
      if (total >= RECOMMEND_SIZE) {
        break; // TODO: Verify this works
      }
    }
    const precision = total > 0 ? found / total : 0
    const recall = toFind.length > 0 ? found / toFind.length : 0

    avgRecall += recall / output.length
    avgPrecision += precision / output.length
  }

  const fScore = 2 * (avgPrecision * avgRecall) / (avgPrecision + avgRecall)

  return {
    recall: avgRecall,
    precision: avgPrecision,
    fScore,
    performance: fScore
  }
};

export const sortIdx = (row: number[]) => {
  return Array.from(Array(row.length).keys())
    // sort descending ( TODO: Verify)
    .sort((a, b) => row[a] - row[b]);
};
