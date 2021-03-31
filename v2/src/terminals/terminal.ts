import { ProblemInstance } from "./../interface/problem.interface";
import {
  fillMatrix,
  RandomMatrix,
  RandomScalar,
  RandomVector,
} from "./fill.terminal";

import { PossibleConfigs } from "./../interface/config.interface";
import { DTO } from "../interface/dto.interface";
import { getPropertyTerminals } from "./property.terminal";
import { NodeImplementation } from "../interface/node.interface";

const terminals = ["fill"];

export const isTerminal = (config: PossibleConfigs) => {
  return terminals.indexOf(config.type) >= 0;
};

export const calcTerminal = (config, problemInstance) => {
  switch (config.type) {
    case "fill":
      return fillMatrix(config.config, problemInstance);
    default:
      throw Error("invalid config");
  }
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
