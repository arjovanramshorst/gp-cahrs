import { Evaluator } from "./evaluator.ts";
import { Recommender } from "../recommender.ts";

export class RandomEvaluator extends Evaluator {
  evaluate(recommender: Recommender) {
    return {
      recall: Math.random(),
      precision: Math.random(),
      fScore: Math.random(),
      performance: Math.random(),
    };
  }
}
