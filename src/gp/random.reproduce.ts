import {Reproduce} from "./reproduce.ts";
import {EvaluatedRecommender} from "../generation.ts";
import {Recommender} from "../recommender.ts";
import {sumBy} from "../utils/functional.utils.ts";

export class RandomReproduce extends Reproduce {
    produceOffspring(parents: EvaluatedRecommender[]): Recommender[] {
        const totalScore = parents.reduce(sumBy(it => it.score), 0)

        const aggregatedParents = parents.reduce((agg, it) => [
            ...agg,
            {
                score: (agg.length > 0 ? agg[agg.length - 1].score : 0) + it.score,
                recommender: it.recommender
            }
        ], [] as EvaluatedRecommender[])

        const offspring = []
        while (offspring.length < parents.length) {
            const index = Math.random() * totalScore
            const foundIndex = aggregatedParents.findIndex(it => it.score > index)
            offspring.push(parents[foundIndex].recommender)
        }

        return offspring;
    }
}