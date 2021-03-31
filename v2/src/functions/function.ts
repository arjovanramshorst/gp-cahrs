import { MultiplyFunction, SumFunction } from "./math.function";
import { PossibleConfigs } from "./../interface/config.interface";
import { DTO } from "../interface/dto.interface";
import { NodeImplementation } from "../interface/node.interface";

const functions = ["sum", "multiply"];

export const isFunction = (config: PossibleConfigs) => {
  return functions.indexOf(config.type) >= 0;
};

export const calcFunction = (config, input) => {
  const Function = FunctionFactory(config.type);
  return Function.evaluate(config, input);
};

export const FunctionFactory = (type: string): FunctionImplementation => {
  const res = Functions.find((it) => it.type === type);

  if (!res) {
    throw Error(`Invalid function type: ${type}`);
  }

  return res;
};

export const Functions: FunctionImplementation[] = [
  SumFunction,
  MultiplyFunction,
];

export interface FunctionImplementation extends NodeImplementation{
  type: string;
  inputSize: number;
  getOutput: (input: DTO[]) => DTO | undefined;
  specifyInput: (output: DTO, input: DTO[]) => DTO[]
  evaluate: (config: any, input: any) => any;
}
