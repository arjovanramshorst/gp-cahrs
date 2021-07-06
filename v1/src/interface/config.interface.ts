import { Reproduce } from "../gp/reproduce.ts";
import {ProblemInstance, ProblemInstanceLight} from "./problem.interface.ts";
import { Evaluator } from "../evaluate/evaluator.ts";
import { Problem } from "../problem/problem.ts";

export interface ConfigInterface {
  maxGeneration: number;
  generationSize: number;
  makeProblem: () => Problem;
  makeReproduce: (instance: ProblemInstanceLight) => Reproduce;
  makeEvaluator: (instance: ProblemInstance) => Evaluator;
  outputFilename: string;
  interleavedTrainingSize: number;
  overfitting: "normal" | "interleaved"
}

export function printConfig(config: ConfigInterface) {
  console.log(`Max # of generations: ${config.maxGeneration}`);
  console.log(`Generation size: ${config.generationSize}`);
}
