import { PropertyType } from "./problem.interface";

export type NodeTerminal = {
  name: string;
  output: DTO;
};

export type NodeFunction = {
  name: string;
  output: DTO;
  input: DTO[];
};

export enum DTOType {
  matrix = "matrix",
  vector = "vector",
  scalar = "scalar",
}

export interface DTO {
  dtoType: DTOType,
}

export const findMatchingType = (left?: DTO, right?: DTO): DTO | undefined => {
  if (!left || !right) {
    return undefined
  }

  // Different types
  if (left.dtoType !== right.dtoType) {
    return undefined;
  }

  const match = {
    dtoType: left.dtoType
  }
  // Check if for every field that is defined in left, if it is the same if defined in right, 
  Object.keys(left).forEach((key) => {
    if (key && right[key] !== left[key]) {
      return undefined;
    } else {
      match[key] = left[key]
    }
  });
  Object.keys(right).forEach((key) => {
    // Set keys missed by previous check
    match[key] = right[key]
  })

  return match;
};

export interface DTOMatrix extends DTO {
  dtoType: DTOType.matrix;
  fromEntity?: string;
  toEntity?: string;
  rows?: number;
  columns?: number;
}

export interface DTOVector extends DTO {
  dtoType: DTOType.vector;
  entity?: string;
  items?: number;
  valueType: PropertyType;
}

export interface DTOScalar extends DTO {
  dtoType: DTOType.scalar;
}
