import { PropertyType } from "./problem.interface";


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

  let match = {
    dtoType: left.dtoType
  }
  // Check if for every field that is defined in left, if it is the same if defined in right, 
  const matchLeft = Object.keys(left).every((key) => {
    // If defined in right, it must be the same, else return undefined
    if (right[key] && right[key] !== left[key]) {
      return false
    } else {
      match[key] = left[key]
      return true
    }
  });
  const matchRight = Object.keys(right).every((key) => {
    // If defined in left, it must be the same, else return undefined
    if (left[key] && right[key] !== left[key]) {
      return false;
    } else {
      match[key] = right[key]
      return true
    }
  })

  if (matchLeft && matchRight) {
    return match
  } else {
    return undefined
  }
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
