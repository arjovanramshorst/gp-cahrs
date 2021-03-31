import { ProblemInstance } from "./problem.interface";
import {DTO} from "./dto.interface";

export type NodeFunction<Config, Input, Output> = (
  config: Config,
  input: Input
) => Output;

export type NodeTerminal<Config, Output> = (
  config: Config,
  problemInstance: ProblemInstance
) => Output;

export interface NodeImplementation {
  type: string;
  createConfig?: (output: DTO) => any;
}
