import { EvaluatedRecommender, Generation } from "../generation.ts";
import { Recommender } from "../recommender.ts";
import {ProblemInstance, ProblemInstanceLight} from "../interface/problem.interface.ts";

export abstract class Reproduce {
  constructor(
    protected readonly problemInstance: ProblemInstanceLight,
  ) {}

  abstract produceOffspring(parents: EvaluatedRecommender[]): Recommender[];
}
