import { TerminalImplementation } from "./terminal";
import {DTOMatrix, DTOType, DTOVector} from "../interface/dto.interface";
import { PropertyType } from "../interface/problem.interface";
import {generateMulberrySeed, mulberry32} from "../utils/random.utils";
import {CONFIG} from "../default.config";

export const RandomMatrix: TerminalImplementation = {
  type: "randomMatrix",
  getOutput: () => ({
    dtoType: DTOType.matrix
  }),
  createConfig: (output: DTOMatrix) => ({
    output,
    seed: generateMulberrySeed()
  }),
  evaluate: (config: { output: DTOMatrix, seed: number }) => {
    const res = []
    const random = mulberry32(config.seed)
    for(let row = 0; row < config.output.rows; row++) {
      res.push([])
      for(let col = 0; col < config.output.columns; col++) {
        res[row].push(random())
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
  createConfig: (output: DTOVector) => ({
    output,
    seed: generateMulberrySeed()
  }),
  evaluate: (config: { output: DTOVector, seed: number }) => {
    const res = []
    const random = mulberry32(config.seed)
    for(let i = 0; i < config.output.items; i++) {
      res.push(random())
    }

    return res
  },
};

export const RandomScalar: TerminalImplementation = {
  type: "randomScalar",
  getOutput: () => ({
    dtoType: DTOType.scalar,
  }),
  createConfig: () => ({ scalar: Math.floor(Math.random() * CONFIG.NODES.SCALAR.MAX) }),
  evaluate: (config: any) => config.scalar,
};
