import { DTO } from "./dto.interface";
import { Matrix, Vector } from "./util.interface";

export type ReadProblemFunction = () => Promise<ProblemInstance>;

export interface ProblemInstance {

  output: DTO;

  // list of movie indexes that should be recommended to each user
  validate: number[][];

  // list of movie indexes that should be filtered from recommendation for each user
  filter: number[][];

  entities: Record<string, Entity>;

  interactions: Record<string, Interaction>;
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
  items: Vector<any>
}

interface StringProperty extends Property {
  type: PropertyType.string;
  items: Vector<string>;
}

interface NumberProperty extends Property {
  type: PropertyType.number;
  items: Vector<number>;
}

interface StringArrayProperty extends Property {
  type: PropertyType.array;
  items: Vector<string[]>;
}

interface Interaction {
  type: string;
  fromEntityType: string;
  toEntityType: string;

  interactions: Matrix<number>;
}
