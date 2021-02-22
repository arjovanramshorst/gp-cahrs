import { EvaluatedRecommender, Generation } from "../generation.ts";
import { Recommender } from "../recommender.ts";
import { ProblemInstance } from "../interface/problem.interface.ts";

export abstract class Reproduce {
  constructor(
    protected readonly problemInstance: ProblemInstance,
  ) {}

  abstract produceOffspring(parents: EvaluatedRecommender[]): Recommender[];
}
