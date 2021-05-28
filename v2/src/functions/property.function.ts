import {DTO, DTOMatrix, DTOType, DTOVector} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";
import {filterUndefined} from "../utils/functional.utils";
import {FunctionImplementation} from "./function";

const compareOutput = (
  type: PropertyType,
  [left, right]: DTO[]
): DTOMatrix | undefined => {
  if (left.dtoType !== DTOType.vector || right.dtoType !== DTOType.vector) {
    return undefined;
  }
  const leftVector = left as DTOVector;
  const rightVector = right as DTOVector;

  if (leftVector.valueType !== type || rightVector.valueType !== type) {
    return undefined;
  }

  return filterUndefined({
    dtoType: DTOType.matrix,
    fromEntity: leftVector.entity,
    toEntity: rightVector.entity,
  });
};

const compareInput = (
  output: DTOMatrix,
  [left, right]: DTOVector[]
): DTOVector[] => {
  return [
    {
      dtoType: DTOType.vector,
      entity: output.fromEntity,
      valueType: left.valueType,
    },
    {
      dtoType: DTOType.vector,
      entity: output.toEntity,
      valueType: right.valueType,
    },
  ].map((it) => filterUndefined(it));
};

const vectorLoop = <T extends any>(fn: (rowItem: T, colItem: T) => number) => (config: any, input: [T[], T[]]) => {
  const res: number[][] = []
  input[0].forEach((rowItem, idx) => {
    res.push([])
    input[1].forEach(colItem => {
      res[idx].push(fn(rowItem, colItem))
    })
  })
  return res
}

const CompareStringFunction: FunctionImplementation<{}> = {
  type: "compareString",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.string, input),
  specifyInput: compareInput,
  evaluate: vectorLoop<string>((rowItem, colItem) => rowItem == colItem ? 1 : 0),
};

const CompareArrayFunction: FunctionImplementation<{}> = {
  type: "compareArray",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.array, input),
  specifyInput: compareInput,
  evaluate: vectorLoop<string[]>((rowItem, colItem) => arraySimilarity(rowItem, colItem))
};

const CompareNumberFunction: FunctionImplementation<{}> = {
  type: "compareNumber",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.number, input),
  specifyInput: compareInput,
  evaluate: vectorLoop<number>((rowItem, colItem) => Math.abs(rowItem - colItem))
};

export const PropertyFunctions = [
  CompareStringFunction,
  CompareArrayFunction,
  // CompareNumberFunction,
];

const arraySimilarity = (a: string[], b: string[]) => {
  const l = intersection(a, b).length;
  return l / (a.length + b.length - l);
}
const intersection = <T>(a: T[], b: T[]): T[] => {
  return a.filter((it) => b.includes(it));
}