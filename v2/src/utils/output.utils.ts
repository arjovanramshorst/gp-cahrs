import {FitnessValue} from "../fitness";
import {ConfigTree} from "../tree";

export const csvHeader = [
  "type",
  "generation",
  "individual",
  "mrr10",
  "precision1",
  "precision5",
  "precision10",
  "f_score",
  "recall",
  "precision",
  "f_score_normalized",
  "recall_normalized",
  "precision_normalized",
  "config",
].join("\t") + "\n"

export const produceCsvLine = (gen: string, type: string, individual: string, fitness: FitnessValue, normalized: FitnessValue, config: ConfigTree) => {
  return [
    type,
    gen,
    individual,
    fitness.mrr,
    fitness.precision1,
    fitness.precision5,
    fitness.precision10,
    fitness.fScore,
    fitness.recall,
    fitness.precision,
    normalized.fScore,
    normalized.recall,
    normalized.precision,
    JSON.stringify(config)
  ].join("\t") + "\n"
}