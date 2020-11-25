import {Recommender} from "../recommender.ts";

export abstract class Evaluate {

    public abstract evaluate(recommender: Recommender): number
}