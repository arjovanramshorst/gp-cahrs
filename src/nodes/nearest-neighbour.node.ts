import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessParams} from "../interface/processor.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {EntityId} from "../interface/entity.interface.ts";
import {CFNodeConfig} from "./cf.node.ts";
import {PropertyNodeConfig} from "./property.node.ts";
import {Matrix, SparseMatrix, VectorMatrix} from "../utils/matrix.utils.ts";
import {Generateable, WithGenerated} from "./node.interface.ts";

interface Generate {
    N: number
    THRESHOLD: number
}

interface ConfigInterface extends Generateable<Generate> {
    interactionType: string
    fromEntityType: string
    toEntityType: string
    // Key to recommend for, otherwise recommend for existence of interaction
    compareValueKey?: string
    inverted: boolean
}

const MAX_N = 40

export class NearestNeighbourConfig extends NodeConfig<NearestNeighbourProcessor> {
    configType = `NN-node (${this.config.inverted ? this.config.toEntityType : this.config.fromEntityType} - ${this.config.interactionType})`

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
        if (!this.config.generated) {
            this.config.generated = {
                N: Math.floor(Math.random() * MAX_N),
                THRESHOLD: Math.random()
            }
        }
    }

    protected generateInput(problemInstance: ProblemInstance) {
        return [
            ...(this.config.inverted ? [] : [new CFNodeConfig({
                entityType: this.config.fromEntityType,
                interactionType: this.config.interactionType,
                comparisonKey: this.config.compareValueKey
            })]),
            ...(this.config.inverted 
	        ? PropertyNodeConfig.PotentialConfigs(problemInstance.entityMap[this.config.toEntityType], problemInstance.entityMap[this.config.toEntityType])
	        : PropertyNodeConfig.PotentialConfigs(problemInstance.entityMap[this.config.fromEntityType], problemInstance.entityMap[this.config.fromEntityType])
	       )
        ]
    }

    protected processorFactory() {
        return new NearestNeighbourProcessor(this.config as WithGenerated<ConfigInterface>)
    }
}

export class NearestNeighbourProcessor extends NodeProcessor<WithGenerated<ConfigInterface>> {
    private interactionMatrix: Matrix<number> = new SparseMatrix()

    private mostSimilar: Record<EntityId, Record<EntityId, number>> = {}

    /**
     * Normalizes the scores for interaction to be recommended by this processor
     *
     * @param instance
     */
    prepare(instance: ProblemInstance): void {
        const matrix = instance.interactionMap[this.config.interactionType].interactionMatrix

        if (this.config.compareValueKey) {
            // Normalize scores and map to compareValueKey
            this.interactionMatrix = matrix.map(this.mapKeyAndNormalize)
        } else {
            this.interactionMatrix = matrix.map(this.mapExistence)
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

        const similarRefs = this.getMostSimilar(params.entityId, input[0].matrix.getRow(params.entityId))

        const ownerInteractions = this.interactionMatrix.getRow(params.entityId)

        // sum (weight * score)
        const scores: Record<EntityId, number> = {}
        // sum weight
        const weights: Record<EntityId, number> = {}
        // counts for each entity
        const counts: Record<EntityId, number> = {}

        Object.keys(similarRefs).forEach(fromRef => {
            const similarity = similarRefs[fromRef]
            Object.keys(this.interactionMatrix.getRow(fromRef)).forEach(toRef => {
                const score = this.interactionMatrix.get(fromRef, toRef) as number

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
            matrix: new VectorMatrix(params.entityId, normalizedScores)
        }
    }

    processInverted(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
        // Get all (positive) ratings by params.entityId
        const ownerInteractions = this.interactionMatrix.getRow(params.entityId)
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
            const mostSimilar = this.getMostSimilar(positiveRef, input[0].matrix.getRow(positiveRef))
            const score = this.interactionMatrix.get(params.entityId, positiveRef) as number
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
            matrix: new VectorMatrix(params.entityId, normalizedScores)
        }
    }

    private mapExistence = (it: any[]) => {
        return it.map(val => 1)
    }

    private mapKeyAndNormalize = (it: any[]) => {
        const scores = it.map(val => val[this.config.compareValueKey as string])
        const max = Math.max(...scores)
        const min = Math.min(...scores)

        return scores.map(score => (score - min) / (max - min))
    }

    private getMostSimilar(ref: EntityId, scores: Record<EntityId, number>): Record<EntityId, number> {
        if (this.mostSimilar[ref]) {
            return this.mostSimilar[ref]
        }

        const mostSimilar = Object.keys(scores)
            .filter(ref => scores[ref] > this.config.generated.THRESHOLD)
            .sort((refA, refB) => scores[refB] - scores[refA])
            .slice(0, this.config.generated.N)
            .reduce((agg, ref) => {
                agg[ref] = scores[ref]

                return agg
            }, {} as Record<EntityId, number>)

        // Cache most similar
        this.mostSimilar[ref] = mostSimilar
        return mostSimilar
    }
}

