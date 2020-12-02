import {Evaluator} from "./evaluator.ts";
import {Recommender} from "../recommender.ts";
import {countBy, sumBy} from "../functional.utils.ts";

// https://link-springer-com.tudelft.idm.oclc.org/referenceworkentry/10.1007/978-1-4939-7131-2_110162
export class RankEvaluator extends Evaluator {

    evaluate(recommender: Recommender): number {
        const recommendations = Object.keys(this.problemInstance.testInteractions)
            .map(fromId => {
                const testInteractions = this.problemInstance.testInteractions[fromId]
                const recommendations = recommender.recommend(fromId)

                const found = recommendations.recommendations
                    .reduce(countBy(it => testInteractions[it.entity.id]!!), 0)

                const total = Object.keys(testInteractions).length
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

        // TODO: Do this? Or max? min? randomly select 1? :p
        return (averageRecall + averagePrecision) / 2
    }
}