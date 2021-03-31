import { DTO, DTOMatrix, DTOType, DTOVector } from "../interface/dto.interface";
import { PropertyType } from "../interface/problem.interface";
import { filterUndefined } from "../utils/functional.utils";
import { FunctionImplementation } from "./function";

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
      items: output.rows,
      valueType: right.valueType,
    },
  ].map((it) => filterUndefined(it));
};

const CompareStringFunction: FunctionImplementation = {
  type: "compareString",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.string, input),
  specifyInput: compareInput,
  evaluate: (input) => undefined, // TODO:
};

const CompareArrayFunction: FunctionImplementation = {
  type: "compareArray",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.array, input),
  specifyInput: compareInput,
  evaluate: (input) => undefined, // TODO:
};

const CompareNumberFunction: FunctionImplementation = {
  type: "compareNumber",
  inputSize: 2,
  getOutput: (input) => compareOutput(PropertyType.number, input),
  specifyInput: compareInput,
  evaluate: (input) => undefined, // TODO:
};

export const PropertyFunctions = [
  CompareStringFunction,
  CompareArrayFunction,
  CompareNumberFunction,
];
