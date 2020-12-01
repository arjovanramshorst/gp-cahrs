import {Reproduce} from "../gp/reproduce.ts";
import {ProblemInstance} from "./problem.interface.ts";
import {Evaluator} from "../evaluate/evaluator.ts";
import {Problem} from "../problem/problem.ts";

export interface ConfigInterface {
    maxGeneration: number
    generationSize: number
    makeProblem: () => Problem
    makeReproduce: () => Reproduce
    makeEvaluator: (instance: ProblemInstance) => Evaluator
}