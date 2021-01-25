import {Recommender} from "../recommender.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";

export interface Result {
    recall: number
    precision: number
    fScore: number
    performance: number
}

export abstract class Evaluator {
    constructor(
        protected readonly problemInstance: ProblemInstance
    ) { }

    public abstract evaluate(recommender: Recommender): Result
}