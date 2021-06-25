import { DTO } from "./dto.interface";
import {ConfigTree} from "../tree";

export type ReadProblemFunction = (
  interleaveSize?: number,
  interleaveSeed?: number,
  actionToRecommend?: string,
  type?: 'dense' | 'sparse'| undefined
) => Promise<ProblemInstance>;

export interface ProblemInstance {
  problemName: string,
  interleaveSize: number,
  interleaveSeed: number,

  output: DTO;

  // list of movie indexes that should be recommended to each user
  validate: number[][];

  // list of movie indexes that should be filtered from recommendation for each user
  filter: number[][];

  entities: Record<string, Entity>;

  interactions: Record<string, Interaction>;

  baseline: ConfigTree;

  baselines?: [string, ConfigTree][]
}

export enum PropertyType {
  array = "array",
  number = "number",
  string = "string"
}

interface Entity {
  type: string;
  refsToIdx: Record<string, number>;
  properties: Record<string, Property>;
}

interface Property {
  type: PropertyType,
  property: string;
  items: any[]
}

interface Interaction {
  type: string;
  fromEntityType: string;
  toEntityType: string;

  interactions: number[][];
}

export interface EntityParams {
  refs: string[],
  refsToIdx: Record<string, number>
}

export interface InteractionParams{
  from: EntityParams,
  to: EntityParams,
  interactionMap: Record<string, string[]>
}