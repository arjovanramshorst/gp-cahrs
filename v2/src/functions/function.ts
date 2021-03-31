import { MultiplyFunction, SumFunction } from "./math.function";
import { PossibleConfigs } from "./../interface/config.interface";
import { DTO } from "../interface/dto.interface";

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

export interface FunctionImplementation {
  type: string;
  inputSize: number;
  getOutput: (input: DTO[]) => DTO | undefined;
  evaluate: (config: any, input: any) => any;
}
