import {DTO, DTOMatrix, DTOType, DTOVector} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";
import {filterUndefined} from "../utils/functional.utils";
import {FunctionImplementation} from "./function";
import {setUnion, setIntersect} from "mathjs"

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
    rows: leftVector.items,
    columns: rightVector.items,
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
      items: output.rows,
      valueType: left.valueType,
    },
    {
      dtoType: DTOType.vector,
      entity: output.toEntity,
      items: output.columns,
      valueType: right.valueType,
    },
  ].map((it) => filterUndefined(it));
};

const vectorLoop = (fn: (rowItem, colItem) => number) => (config, input: any[]) => {
  const res = []
  input[0].forEach((rowItem, idx) => {
    res.push([])
    input[1].forEach(colItem => {
      res[idx].push(fn(rowItem, colItem))
    })
  })
  return res
}

const CompareStringFunction: FunctionImplementation = {
  type: "compareString",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.string, input),
  specifyInput: compareInput,
  evaluate: vectorLoop((rowItem, colItem) => rowItem == colItem ? 1 : 0),
};

const CompareArrayFunction: FunctionImplementation = {
  type: "compareArray",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.array, input),
  specifyInput: compareInput,
  evaluate: vectorLoop((rowItem, colItem) => 1 - setIntersect(rowItem, colItem).length / setUnion(rowItem, colItem).length)
};

const CompareNumberFunction: FunctionImplementation = {
  type: "compareNumber",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.number, input),
  specifyInput: compareInput,
  evaluate: vectorLoop((rowItem, colItem) => Math.abs(rowItem - colItem))
};



export const PropertyFunctions = [
  CompareStringFunction,
  CompareArrayFunction,
  CompareNumberFunction,
];
