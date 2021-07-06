import { ProcessNodeDTO } from "./processor.interface.ts";
import { Matrix } from "../utils/matrix.utils.ts";
import { EntityId } from "./entity.interface.ts";

export interface SimilarityScores extends ProcessNodeDTO {
  fromEntityType: string;
  toEntityType: string;
  matrix: Matrix<number>;
}

export interface Recommendations extends ProcessNodeDTO {
  interactionType: string;
  recommendations: Recommendation[];
}

interface Recommendation {
  entity: any;
  score: number;
}

// @Deprecated
export type ValueMatrix<T> = Record<EntityId, Record<EntityId, T>>;

export interface NodeOutput {
  fromType: string;
  toType: string;
}
