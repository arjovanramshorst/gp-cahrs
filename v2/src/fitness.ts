import { ProblemInstance } from "./interface/problem.interface";
import {sortIdx} from "./utils/sort.utils";

export interface FitnessValue {
  recall: number;
  precision: number;
  fScore: number;
  performance: number;
}

export interface Score {
  raw: FitnessValue,
  normalized?: FitnessValue
}

const RECOMMEND_SIZE = 10

export const fitnessScore = (output: number[][], problem: ProblemInstance, baseline?: FitnessValue): Score => {

  let avgRecall = 0;
  let avgPrecision = 0;

  for (let userIdx = 0; userIdx < output.length; userIdx++) {
    const topIdx = sortIdx(output[userIdx])
    const topScores = topIdx.map(idx => output[userIdx][idx])
    const toFilter = problem.filter[userIdx]
    const toFind = problem.validate[userIdx]
    let total = 0;
    let found = 0;

    if (!toFilter) {
      debugger
    }
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
        break;
      }
    }
    const precision = total > 0 ? found / total : 0
    const recall = toFind.length > 0 ? found / toFind.length : 0

    avgRecall += recall / output.length
    avgPrecision += precision / output.length
  }

  let fScore = 0

  if (avgPrecision + avgRecall > 0) {
    fScore = 2 * (avgPrecision * avgRecall) / (avgPrecision + avgRecall)
  }

  const raw = {
    recall: avgRecall,
    precision: avgPrecision,
    fScore,
    performance: fScore
  }

  const normalized = baseline ? {
    recall: raw.recall - baseline.recall,
    precision: raw.precision - baseline.precision,
    fScore: raw.fScore - baseline.fScore,
    performance: raw.performance - baseline.performance
  } : undefined

  return {
    raw,
    normalized
  }
};
