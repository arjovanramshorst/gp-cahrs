import {TerminalImplementation} from "./terminal";
import {DTO, DTOMatrix, DTOScalar, DTOType, DTOVector} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";
import {generateMulberrySeed, mulberry32} from "../utils/random.utils";
import {CONFIG} from "../default.config";
import {NodeConfig} from "../tree";

interface FillConfig<T> {
  output: T
  seed: number
}

export const RandomMatrix: TerminalImplementation<FillConfig<DTOMatrix>> = {
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
    for (let row = 0; row < config.output.rows; row++) {
      res.push([])
      for (let col = 0; col < config.output.columns; col++) {
        res[row].push(random())
      }
    }
    return res
  },
};

export const RandomVector: TerminalImplementation<FillConfig<DTOVector>> = {
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
    for (let i = 0; i < config.output.items; i++) {
      res.push(random())
    }

    return res
  },
};

export const RandomScalar: TerminalImplementation<FillConfig<DTOScalar>> = {
  type: "randomScalar",
  getOutput: () => ({
    dtoType: DTOType.scalar,
  }),
  createConfig: (output: DTOScalar) => ({
    output,
    seed: Math.floor(1 + Math.random() * CONFIG.NODES.SCALAR.MAX)
  }),
  evaluate: (config, problem) => config.seed,
};
