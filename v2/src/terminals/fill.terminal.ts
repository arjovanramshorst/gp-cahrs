import { TerminalImplementation } from "./terminal";
import {DTOMatrix, DTOType, DTOVector} from "../interface/dto.interface";
import { PropertyType } from "../interface/problem.interface";

export const RandomMatrix: TerminalImplementation = {
  type: "randomMatrix",
  getOutput: () => ({
    dtoType: DTOType.matrix
  }),
  createConfig: (output: DTOMatrix) => output,
  evaluate: (config: DTOMatrix) => {
    const res = []
    for(let row = 0; row < config.rows; row++) {
      res.push([])
      for(let col = 0; col < config.columns; col++) {
        // TODO: Add seed
        res[row].push(Math.random())
      }
    }
    return res
  },
};

export const RandomVector: TerminalImplementation = {
  type: "randomVector",
  getOutput: () => ({
    dtoType: DTOType.vector,
    valueType: PropertyType.number,
  }),
  createConfig: (output: DTOVector) => output,
  evaluate: (config: DTOVector) => {
    const res = Array(config.items)
    for(let i = 0; i < config.items; i++) {
      // TODO add seed
      res.push(Math.random())
    }

    return res
  },
};

export const RandomScalar: TerminalImplementation = {
  type: "randomScalar",
  getOutput: () => ({
    dtoType: DTOType.scalar,
  }),
  evaluate: (config: any) => {
    // todo:
    const res = Math.random()
    return res
  },
};
