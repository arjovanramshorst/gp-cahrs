import {ConfigInterface} from "./interface/config.interface.ts";
import {RandomReproduce} from "./gp/random.reproduce.ts";
import {ProblemInstance} from "./interface/problem.interface.ts";
import {RankEvaluator} from "./evaluate/rank.evaluator.ts";
import {MovielensProblem} from "./problem/movielens.problem.ts";

export const defaultConfig: ConfigInterface = {
    maxGeneration: 5,
    generationSize: 5,
    makeProblem: () => new MovielensProblem(),
    makeReproduce: () => new RandomReproduce(),
    makeEvaluator: (instance: ProblemInstance) => new RankEvaluator(instance)
}
