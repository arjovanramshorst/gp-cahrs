import { PropertyFunctions } from "./property.function";
import { MathFunctions } from "./math.function";
import { DTO } from "../interface/dto.interface";
import { NodeImplementation } from "../interface/node.interface";
import {NodeConfig} from "../tree";
import {SimilarityFunctions} from "./similarity.function";
import {CFFunctions} from "./cf.function";
import {PopularityFunctions} from "./popularity.function";
import {MatrixFunctions} from "./matrix.function";


export const specifyInputDto = (config: NodeConfig, output: DTO, input: any) => {
  const Function = FunctionFactory(config.type);
  return Function.specifyInput(output, input);
}

export const calcFunction = (config: NodeConfig, input: any) => {
  const Function = FunctionFactory(config.type);
  return Function.evaluate(config, input);
};

export const FunctionFactory = (type: string): FunctionImplementation<any> => {
  const res = Functions.find((it) => it.type === type);

  if (!res) {
    throw Error(`Invalid function type: ${type}`);
  }

  return res;
};

export const Functions: FunctionImplementation<any>[] = [
  ...MathFunctions,
  ...PropertyFunctions,
  ...SimilarityFunctions,
  ...CFFunctions,
  ...PopularityFunctions,
  ...MatrixFunctions,
];

export interface FunctionImplementation<T extends Omit<NodeConfig, "type">> extends NodeImplementation<T> {
  type: string;
  inputSize: number;
  getOutput: (input: DTO[]) => DTO | undefined;
  specifyInput: (output: DTO, input: DTO[]) => DTO[];
  evaluate: (config: T, input: any) => any;
}
