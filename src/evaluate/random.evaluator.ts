import {Evaluator} from "./evaluator.ts";
import {Recommender} from "../recommender.ts";

export class RandomEvaluator extends Evaluator {
    evaluate(recommender: Recommender): number {
        return Math.random();
    }
}