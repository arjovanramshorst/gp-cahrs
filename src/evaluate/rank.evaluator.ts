import {Evaluator, Result} from "./evaluator.ts";
import {Recommender} from "../recommender.ts";
import {countBy, sumBy} from "../utils/functional.utils.ts";
import {getRenderer} from "../renderer.ts";
import { Matrix } from "../utils/matrix.utils.ts";

// https://link-springer-com.tudelft.idm.oclc.org/referenceworkentry/10.1007/978-1-4939-7131-2_110162
export class RankEvaluator extends Evaluator {
    evaluate(recommender: Recommender, validate: boolean = false): Result {

        if (validate === false && this.cache[recommender.hash()]) {
            return this.cache[recommender.hash()]
        }

        const testInteractions: Matrix<any> = validate ? this.problemInstance.validateInteractions : this.problemInstance.testInteractions
        const keys = testInteractions.getFromRefs()
        const recommendations = keys
            .map((fromId, idx) => {
                getRenderer().setProgress(idx, keys.length)

                const interactions = testInteractions.getRow(fromId)
                const recommendations = recommender.recommend(fromId)

                const found = recommendations.recommendations
                    .reduce(countBy(it => interactions[it.entity.id]!!), 0)

                const total = Object.keys(interactions).length
                // console.log(`recommendations: ${recommendations}`)
                // console.log(`found ${found} of total ${total}`)
                const nrRecommendations = recommendations.recommendations.length

                return {
                    fromId,
                    recommendations,
                    recall: found / total,
                    // Divide by 0 error if there are no recommendations for a certain user, TODO: Figure out what to do in this situation
                    precision: nrRecommendations ? found / Math.min(nrRecommendations, total) : 0
                }
            })

        const averageRecall = recommendations.reduce(sumBy(it => it.recall), 0) / recommendations.length
        const averagePrecision = recommendations.reduce(sumBy(it => it.precision), 0) / recommendations.length

        const fScore = 2 * (averagePrecision * averageRecall) / (averagePrecision + averageRecall)

        const result = {
            recall: averageRecall,
            precision: averagePrecision,
            fScore,
            performance: (Number.isNaN(fScore) || fScore < 0) ? 0 : fScore
        }
        this.cache[recommender.hash()] = result

        return result
    }
}