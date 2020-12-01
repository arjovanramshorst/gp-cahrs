import {Recommender} from "../recommender.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";

export abstract class Evaluator {
    constructor(
        protected readonly problemInstance: ProblemInstance
    ) { }

    public abstract evaluate(recommender: Recommender): number
}