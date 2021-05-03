import {FitnessValue} from "../fitness";
import {ConfigTree} from "../tree";

export const csvHeader = [
  "Gen #",
  "Individual",
  "fScore",
  "recall",
  "precision",
  "fScore (normalized)",
  "recall (normalized)",
  "precision (normalized)",
  "config",
].join("\t") + "\n"

export const produceCsvLine = (gen: string, individual: string, fitness: FitnessValue, normalized: FitnessValue, config: ConfigTree) => {
  return [
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