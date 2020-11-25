import {Evaluate} from "./evaluate.ts";
import {Recommender} from "../recommender.ts";

export class RandomEvaluate extends Evaluate {
    evaluate(recommender: Recommender): number {
        return Math.random();
    }
}