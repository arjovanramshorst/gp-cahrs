import {Reproduce} from "./reproduce.ts";
import {combineInputs, EvaluatedRecommender} from "../generation.ts";
import {Recommender} from "../recommender.ts";
import {sumBy} from "../utils/functional.utils.ts";
import {NodeConfig} from "../nodes/node.ts";
import {NodeFactory} from "../nodes/node.interface.ts";
import {RootNodeConfig} from "../nodes/root.node.ts";

const MUTATION_CHANCE = 0.007 // 0.7%

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

            const childConfigObject = parents[foundIndex].recommender.getConfig().stringify()

            const newConfig = NodeConfig.parse(childConfigObject, NodeFactory)
                .mutate(this.problemInstance, combineInputs, MUTATION_CHANCE) as RootNodeConfig

            const child = new Recommender(this.problemInstance)
                .init(newConfig)

            offspring.push(child)
        }

        return offspring;
    }
}

