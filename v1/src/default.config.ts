import { ConfigInterface } from "./interface/config.interface.ts";
import { RandomReproduce } from "./gp/random.reproduce.ts";
import {ProblemInstance, ProblemInstanceLight} from "./interface/problem.interface.ts";
import { RankEvaluator } from "./evaluate/rank.evaluator.ts";
import { MovielensProblem } from "./problem/movielens.problem.ts";

export const defaultConfig: ConfigInterface = {
  maxGeneration: 30,
  generationSize: 20,
  makeProblem: () => new MovielensProblem(),
  makeReproduce: (instance: ProblemInstanceLight) => new RandomReproduce(instance),
  makeEvaluator: (instance: ProblemInstance) => new RankEvaluator(instance),
  outputFilename: `Run_${new Date().toISOString()}`,
  interleavedTrainingSize: 0.1,
  overfitting: "interleaved",
};
