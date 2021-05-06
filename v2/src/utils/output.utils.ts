import {FitnessValue} from "../fitness";
import {ConfigTree} from "../tree";

export const csvHeader = [
  "type",
  "generation",
  "individual",
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
    fitness.fScore,
    fitness.recall,
    fitness.precision,
    normalized.fScore,
    normalized.recall,
    normalized.precision,
    JSON.stringify(config)
  ].join("\t") + "\n"
}