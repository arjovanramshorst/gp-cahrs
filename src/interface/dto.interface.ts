import {ProcessNodeDTO} from "./processor.interface.ts";

type ValueMatrix = Record<string, Record<string, number>>

export interface SimilarityScores extends ProcessNodeDTO {
    fromEntityType: string
    toEntityType: string
    matrix: ValueMatrix
}

export interface CFMatrix extends ProcessNodeDTO {
    entityType: string
    matrix: ValueMatrix
}

export interface Recommendations extends ProcessNodeDTO {
    interactionType: string
    recommendations: Recommendation[]
}

interface Recommendation {
    entity: any
    score: number
}