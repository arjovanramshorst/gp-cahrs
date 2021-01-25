import {Reproduce} from "./reproduce.ts";
import {combineInputs, EvaluatedRecommender} from "../generation.ts";
import {Recommender} from "../recommender.ts";
import {sumBy} from "../utils/functional.utils.ts";

const MUTATION_CHANCE = 0.07 // 0.7%

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
            let foundIndex

            if (totalScore > 0) {
                const index = Math.random() * totalScore
                foundIndex = aggregatedParents.findIndex(it => it.score > index)
            } else {
                // Handles the case when an entire generation is f*d
                foundIndex = Math.floor(Math.random() * parents.length)
            }

            const childConfig = parents[foundIndex].recommender.getConfig().mutate(this.problemInstance, combineInputs, MUTATION_CHANCE)
            const child = new Recommender(this.problemInstance)
                .init(childConfig)

            offspring.push(child)
        }

        return offspring;
    }
}

