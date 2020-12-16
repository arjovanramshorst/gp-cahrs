import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessParams} from "../interface/processor.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {InteractionMatrix} from "../interface/interaction.interface.ts";
import {invertMatrix, mapMatrixValues, valuesOf} from "../utils/functional.utils.ts";
import {EntityId} from "../interface/entity.interface.ts";
import {RandomNodeConfig} from "./random.node.ts";
import {CFNodeConfig} from "./cf.node.ts";
import {PropertyNodeConfig} from "./property.node.ts";
import {Matrix} from "../utils/matrix.utils.ts";

interface ConfigInterface {
    interactionType: string
    fromEntityType: string
    toEntityType: string
    // Key to recommend for, otherwise recommend for existence of interaction
    compareValueKey?: string
    inverted: boolean
}

// TODO: optimize? add to config?
const N = 20
const THRESHOLD = 0.5

export class NearestNeighbourConfig extends NodeConfig<NearestNeighbourProcessor> {
    configType = `NN-node (${this.config.inverted ? this.config.fromEntityType : this.config.toEntityType} - ${this.config.interactionType})`

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput(problemInstance: ProblemInstance) {
        return [
            new RandomNodeConfig({
                fromEntityType: this.config.fromEntityType,
                toEntityType: this.config.fromEntityType
            }),
            ...(this.config.inverted ? [] : [new CFNodeConfig({
                entityType: this.config.fromEntityType,
                interactionType: this.config.interactionType,
                comparisonKey: this.config.compareValueKey
            })]),
            ...PropertyNodeConfig.PotentialConfigs(problemInstance.entityMap[this.config.fromEntityType], problemInstance.entityMap[this.config.fromEntityType])
        ]
    }

    protected processorFactory() {
        return new NearestNeighbourProcessor(this.config)
    }
}

export class NearestNeighbourProcessor extends NodeProcessor<ConfigInterface> {
    private interactionMatrix: InteractionMatrix<number> = {}
    /**
     * Normalizes the scores for interaction to be recommended by this processor
     *
     * @param instance
     */
    prepare(instance: ProblemInstance): void {
        const matrix = instance.interactionMap[this.config.interactionType].interactionMatrix
        let mapFunction = (it: any) => 1
        if (this.config.compareValueKey) {
            // Normalize scores if necessary
            const interactions = valuesOf(matrix)
                .map(it => it[this.config.compareValueKey ?? ""]) // TODO ANNOYING $#%@#$@#^% HACK, SOMETHING FROM DENO?

            const max = Math.max(...interactions)
            const min = Math.min(...interactions)
            mapFunction = (it: any) => (it[this.config.compareValueKey ?? ""] - min) / (max - min) // TODO: AGAIN, WHY ISN'T DENO @#$#$ SMART ENOUGH TO KNOW IT IS NOT UNDEFINED HERE
        }

        const interactionMatrix = mapMatrixValues<any>(mapFunction)(matrix)
        if (this.config.inverted) {
            this.interactionMatrix = invertMatrix(interactionMatrix)
        } else {
            this.interactionMatrix = interactionMatrix
        }
    }


    process(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
        if (this.config.inverted) {
            return this.processInverted(input, params)
        } else {
            return this.processUser(input, params)
        }
    }

    processUser(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
        if (input.length !== 1) {
            throw new Error("Invalid input length")
        }

        if (input[0].fromEntityType !== input[0].toEntityType) {
            throw new Error("NN only works on input with fromEntityType == toEntityType")
        }

        if (input[0].fromEntityType !== this.config.fromEntityType) {
            throw new Error("Config and input should be the same")
        }

        const similarRefs = this.getMostSimilar(input[0].matrix[params.entityId])

        const ownerInteractions = this.interactionMatrix[params.entityId] ?? {}

        // sum (weight * score)
        const scores: Record<EntityId, number> = {}
        // sum weight
        const weights: Record<EntityId, number> = {}
        // counts for each entity
        const counts: Record<EntityId, number> = {}

        Object.keys(similarRefs).forEach(fromRef => {
            const similarity = similarRefs[fromRef]
            Object.keys(this.interactionMatrix[fromRef]).forEach(toRef => {
                const score = this.interactionMatrix[fromRef][toRef]

                scores[toRef] = (scores[toRef] || 0) + (score * similarity)
                weights[toRef] = (weights[toRef] || 0) + similarity
                counts[toRef] = (counts[toRef] || 0) + 1
            })
        })

        // Delete interactions that the entity has already interacted with
        Object.keys(ownerInteractions).forEach(toRef => {
            delete scores[toRef]
        })

        const normalizedScores = Object.keys(scores).map(toRef => ({
            toRef,
            score: scores[toRef] * weights[toRef] / counts[toRef],
        })).reduce((agg, {toRef, score}) => {
            agg[toRef] = score

            return agg
        }, {} as Record<EntityId, number>)

        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: {
                [params.entityId]: normalizedScores,
            }
        }
    }

    processInverted(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
        // Get all (positive) ratings by params.entityId
        const ownerInteractions = this.interactionMatrix[params.entityId] ?? {}
        const toRefs = Object.keys(ownerInteractions)
        const positiveToRefs = toRefs.filter(toRef => ownerInteractions[toRef] > 0)


        // sum (weight * score)
        const scores: Record<EntityId, number> = {}
        // sum weight
        const weights: Record<EntityId, number> = {}
        // counts for each entity
        const counts: Record<EntityId, number> = {}

        // find for each rating N most similar entities
        positiveToRefs.forEach(positiveRef => {
            const mostSimilar = this.getMostSimilar(input[0].matrix[positiveRef])
            const score = this.interactionMatrix[params.entityId][positiveRef]
            Object.keys(mostSimilar).forEach(similarRef => {
                const similarity = mostSimilar[similarRef]

                scores[similarRef] = (scores[positiveRef] || 0) + (score * similarity)
                weights[similarRef] = (weights[positiveRef] || 0) + similarity
                counts[similarRef] = (counts[positiveRef] || 0) + 1

            })
        })

        Object.keys(ownerInteractions).forEach(toRef => {
            delete scores[toRef]
        })

        // Normalize scores
        const normalizedScores = Object.keys(scores).map(toRef => ({
            toRef,
            score: scores[toRef] * weights[toRef] / counts[toRef],
        })).reduce((agg, {toRef, score}) => {
            agg[toRef] = score

            return agg
        }, {} as Record<EntityId, number>)

        // output result
        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: {
                [params.entityId]: normalizedScores
            }
        }
    }

    private getMostSimilar(scores: Record<string, number>): Record<EntityId, number> {
        return Object.keys(scores)
            .filter(ref => scores[ref] > THRESHOLD)
            .sort((refA, refB) => scores[refB] - scores[refA])
            .slice(0, N)
            .reduce((agg, ref) => {
                agg[ref] = scores[ref]

                return agg
            }, {} as Record<EntityId, number>)
    }
}

