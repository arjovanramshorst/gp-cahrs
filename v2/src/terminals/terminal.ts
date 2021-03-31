import { ProblemInstance } from "../interface/problem.interface";
import {
  RandomMatrix,
  RandomScalar,
  RandomVector,
} from "./fill.terminal";

import { DTO } from "../interface/dto.interface";
import { getPropertyTerminals } from "./property.terminal";
import { NodeImplementation } from "../interface/node.interface";
import {NodeConfig} from "../tree";


export const calcTerminal = (config: NodeConfig, problemInstance) => {
  const Terminal = TerminalFactory(getTerminals(problemInstance), config.type)
  return Terminal.evaluate(config, problemInstance)
};

export const TerminalFactory = (
  terminals: TerminalImplementation[],
  type: string
): TerminalImplementation => {
  const res = terminals.find((it) => it.type === type);

  if (!res) {
    throw Error(`Invalid function type: ${type}`);
  }

  return res;
};

export const getTerminals = (
  problemInstance: ProblemInstance
): TerminalImplementation[] => [
  RandomMatrix,
  RandomScalar,
  RandomVector,
  ...getPropertyTerminals(problemInstance),
];

export interface TerminalImplementation extends NodeImplementation {
  getOutput: () => DTO | undefined;
  // TODO: problemInstance might not be necessary here?
  evaluate: (config: any, problemInstance: ProblemInstance) => any;
}

interface ConfigTree {
  config: Config;
  output: DTO;
  input: ConfigTree[];
}

interface Config {
  type: string;
}
