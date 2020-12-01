import {ProcessNodeDTO} from "./processor.interface.ts";

export type ValueMatrix<T> = Record<string, Record<string, T>>

export interface SimilarityScores extends ProcessNodeDTO {
    fromEntityType: string
    toEntityType: string
    matrix: ValueMatrix<number>
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