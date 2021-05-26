import {PropertyType} from "./problem.interface";


export enum DTOType {
  matrix = "matrix",
  vector = "vector",
  scalar = "scalar",
}

export type DTO = DTOMatrix | DTOVector | DTOScalar

export const findMatchingType = <T extends DTO>(left?: T, right?: T): T | undefined => {
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
    // @ts-ignore
    if (right[key] && right[key] !== left[key]) {
      return false
    } else {
      // @ts-ignore
      match[key] = left[key]
      return true
    }
  });
  const matchRight = Object.keys(right).every((key) => {
    // If defined in left, it must be the same, else return undefined
    // @ts-ignore
    if (left[key] && right[key] !== left[key]) {
      return false;
    } else {
      // @ts-ignore
      match[key] = right[key]
      return true
    }
  })

  if (matchLeft && matchRight) {
    return match as T
  } else {
    return undefined
  }
};

export const sameOrUndefined = <T>(left?: T, right?: T) => {
  if (!left || !right) {
    return true
  } else {
    return left === right
  }
}

export interface DTOMatrix {
  dtoType: DTOType.matrix;
  fromEntity?: string;
  toEntity?: string;
  // rows?: number;
  // columns?: number;
}

export interface DTOVector {
  dtoType: DTOType.vector;
  entity?: string;
  // items?: number;
  valueType: PropertyType;
}

export interface DTOScalar {
  dtoType: DTOType.scalar;
}
