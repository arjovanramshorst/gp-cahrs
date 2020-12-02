import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessParams} from "../interface/processor.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {InteractionMatrix} from "../interface/interaction.interface.ts";
import {mapMatrixValues, valuesOf} from "../functional.utils.ts";
import {EntityId} from "../interface/entity.interface.ts";
import { RandomNodeConfig } from "./random.node.ts";
import {CFNodeConfig} from "./cf.node.ts";

interface ConfigInterface {
    interactionType: string
    fromEntityType: string
    toEntityType: string
    // Key to recommend for, otherwise recommend for existence of interaction
    compareValueKey?: string
}

// TODO: optimize? add to config?
const N = 20
const THRESHOLD = 0.5

export class NearestNeighbourConfig extends NodeConfig<NearestNeighbourProcessor> {
    configType = "NN-node"

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput() {
        return [
            new RandomNodeConfig({
                fromEntityType: this.config.fromEntityType,
                toEntityType: this.config.fromEntityType
            }),
            new CFNodeConfig({
                entityType: this.config.fromEntityType,
                interactionType: this.config.interactionType,
                comparisonKey: this.config.compareValueKey
            })
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
    prepare(instance: ProblemInstance): any {
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

        this.interactionMatrix = mapMatrixValues<any>(mapFunction)(matrix)
    }

    process(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
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

        const ownerInteractions = this.interactionMatrix[params.entityId] ?? []

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
        })).reduce((agg, { toRef, score }) => {
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

