import {ProcessNodeDTO} from "./processor.interface.ts";
import {DenseMatrix, Matrix} from "../utils/matrix.utils.ts";
import {EntityId} from "./entity.interface.ts";


export interface SimilarityScores extends ProcessNodeDTO {
    fromEntityType: string
    toEntityType: string
    matrix: Matrix<number>
}

export interface CFMatrix extends ProcessNodeDTO {
    entityType: string
    matrix: DenseMatrix<number>
}

export interface Recommendations extends ProcessNodeDTO {
    interactionType: string
    recommendations: Recommendation[]
}

interface Recommendation {
    entity: any
    score: number
}

// @Deprecated
export type ValueMatrix<T> = Record<EntityId, Record<EntityId, T>>