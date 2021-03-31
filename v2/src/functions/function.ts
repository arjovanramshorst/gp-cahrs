import { PropertyFunctions } from "./property.function";
import { MathFunctions } from "./math.function";
import { DTO } from "../interface/dto.interface";
import { NodeImplementation } from "../interface/node.interface";
import {NodeConfig} from "../tree";


export const calcFunction = (config: NodeConfig, input: any) => {
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
  ...MathFunctions,
  ...PropertyFunctions,
];

export interface FunctionImplementation extends NodeImplementation {
  type: string;
  inputSize: number;
  getOutput: (input: DTO[]) => DTO | undefined;
  specifyInput: (output: DTO, input: DTO[]) => DTO[];
  evaluate: (config: NodeConfig, input: any) => any;
}
