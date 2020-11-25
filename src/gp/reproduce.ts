import {EvaluatedRecommender, Generation} from "../generation.ts";
import {Recommender} from "../recommender.ts";


export abstract class Reproduce {
    abstract produceOffspring(parents: EvaluatedRecommender[]): Recommender[]
}