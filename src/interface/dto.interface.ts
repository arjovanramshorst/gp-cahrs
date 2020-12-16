import {ProcessNodeDTO} from "./processor.interface.ts";
import {EntityId} from "./entity.interface.ts";
import {Matrix} from "../utils/matrix.utils.ts";

export type ValueMatrix<T> = Record<EntityId, Record<EntityId, T>>

export interface SimilarityScores extends ProcessNodeDTO {
    fromEntityType: string
    toEntityType: string
    matrix: ValueMatrix<number>
    newMatrix?: Matrix<number>
}

export interface CFMatrix extends ProcessNodeDTO {
    entityType: string
    matrix: ValueMatrix<number>
}

export interface Recommendations extends ProcessNodeDTO {
    interactionType: string
    recommendations: Recommendation[]
}

interface Recommendation {
    entity: any
    score: number
}