import { ProblemInstance } from "./interface/problem.interface";
import {sortIdx} from "./utils/sort.utils";
import {toIdxMap} from "./utils/functional.utils";

export interface FitnessValue {
  recall: number;
  precision: number;
  fScore: number;
  performance: number;
  precision1: number;
  precision5: number;
  precision10: number;
  mrr: number;
}

export interface Score {
  raw: FitnessValue,
  normalized?: FitnessValue
}

const RECOMMEND_SIZE = 10

export const fitnessScore = (output: number[][], problem: ProblemInstance, baseline?: FitnessValue): Score => {

  let avgRecall = 0;
  let avgPrecision = 0;

  let avgScores = {
    precision1: 0,
    precision5: 0,
    precision10: 0,
    mrr: 0,
  }

  for (let userIdx = 0; userIdx < output.length; userIdx++) {
    const topIdx = sortIdx(output[userIdx])
    const topScores = topIdx.map(idx => output[userIdx][idx])
    const toFilter = problem.filter[userIdx]
    const toFilterMap = toFilter.reduce((agg, curr) => {agg[curr] = true; return agg}, {})
    const toFind = problem.validate[userIdx]
    const toFindMap = toFind.reduce((agg, curr) => {agg[curr] = true; return agg}, {})
    let total = 0;
    let found = 0;

    let scores = {
      precision1: 0,
      precision5: 0,
      precision10: 0,
      mrr: 0,
    }

    if (!toFilter) {
      debugger
    }
    for (let i = 0; i < topIdx.length; i++) {
      if (toFilterMap[topIdx[i]]) {
        // Recommendation is not filtered
        total++
        if (toFindMap[topIdx[i]]) {
        // Recommendation is "correct"
          found++
          scores.mrr += (1 / total)
        }
      }
      if (total === 1) {
        scores.precision1 = found
      }
      if (total === 5) {
        scores.precision5 = found / 5
      }
      if (total === 10) {
        scores.precision10 = found / 10
      }

      if (total >= RECOMMEND_SIZE) {
        break;
      }
    }
    const precision = total > 0 ? found / total : 0
    const recall = toFind.length > 0 ? found / toFind.length : 0

    avgRecall += recall / output.length
    avgPrecision += precision / output.length

    avgScores.mrr += scores.mrr / output.length
    avgScores.precision1 += scores.precision1 / output.length
    avgScores.precision5 += scores.precision5 / output.length
    avgScores.precision10 += scores.precision10 / output.length
  }

  let fScore = 0

  if (avgPrecision + avgRecall > 0) {
    fScore = 2 * (avgPrecision * avgRecall) / (avgPrecision + avgRecall)
  }

  const raw = {
    recall: avgRecall,
    precision: avgPrecision,
    fScore,
    performance: avgScores.mrr,
    ...avgScores
  }

  const normalized = baseline ? {
    recall: raw.recall - baseline.recall,
    precision: raw.precision - baseline.precision,
    fScore: raw.fScore - baseline.fScore,
    performance: raw.performance - baseline.performance,
    precision1: raw.precision1 - baseline.precision1,
    precision5: raw.precision5 - baseline.precision5,
    precision10: raw.precision10 - baseline.precision10,
    mrr: raw.mrr - baseline.mrr

  } : undefined

  return {
    raw,
    normalized
  }
};
