import {Reproduce} from "../gp/reproduce.ts";
import {ProblemInstance} from "./problem.interface.ts";
import {Evaluator} from "../evaluate/evaluator.ts";
import {Problem} from "../problem/problem.ts";

export interface ConfigInterface {
    maxGeneration: number
    generationSize: number
    makeProblem: () => Problem
    makeReproduce: (instance: ProblemInstance) => Reproduce
    makeEvaluator: (instance: ProblemInstance) => Evaluator
    outputFilename: string
    interleavedTrainingSize: number
}

export function printConfig(config: ConfigInterface) {
    console.log(`Max # of generations: ${config.maxGeneration}`)
    console.log(`Generation size: ${config.generationSize}`)
}