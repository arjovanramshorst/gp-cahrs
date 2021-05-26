import {zeros} from "mathjs"
import {TerminalImplementation} from "./terminal";
import {DTO, DTOMatrix, DTOScalar, DTOType, DTOVector} from "../interface/dto.interface";
import {PropertyType} from "../interface/problem.interface";
import {generateMulberrySeed, mulberry32} from "../utils/random.utils";
import {CONFIG} from "../config";

interface FillConfig {
  seed: number
}

export const RandomMatrix: TerminalImplementation<FillConfig> = {
  type: "randomMatrix",
  getOutput: () => ({
    dtoType: DTOType.matrix
  }),
  createConfig: () => ({
    seed: Math.floor(1 + Math.random() * CONFIG.NODES.SCALAR.MAX)
  }),
  evaluate: ({seed}, problem, output: DTOMatrix) => {
    const res = []
    try {
      const rows = Object.keys(problem.entities[output.fromEntity].refsToIdx).length
      const columns = Object.keys(problem.entities[output.toEntity].refsToIdx).length
      for (let row = 0; row < rows; row++) {
        res.push([])
        for (let col = 0; col < columns; col++) {
          res[row].push(seed)
        }
      }
      return res
    } catch (e) {
      debugger
    }
  },
};

// export const RandomVector: TerminalImplementation<FillConfig> = {
//   type: "randomVector",
//   getOutput: () => ({
//     dtoType: DTOType.vector,
//     valueType: PropertyType.number,
//   }),
//   createConfig: (output: DTOVector) => ({
//     seed: generateMulberrySeed()
//   }),
//   evaluate: ({  seed}, problem, output: DTOVector) => {
//     const res = []
//     const random = mulberry32(seed)
//     for (let i = 0; i < output.items; i++) {
//       res.push(random())
//     }
//
//     return res
//   },
// };

export const RandomScalar: TerminalImplementation<FillConfig> = {
  type: "randomScalar",
  getOutput: () => ({
    dtoType: DTOType.scalar,
  }),
  createConfig: (output: DTOScalar) => ({
    seed: Math.floor(1 + Math.random() * CONFIG.NODES.SCALAR.MAX)
  }),
  evaluate: (config, problem) => config.seed,
};

export const EmptyTerminal = (defaultDTO: DTO): TerminalImplementation<any> => {
  return {
    type: "empty",
    getOutput: () => defaultDTO,
    evaluate: (config, problem, output) => {
      if (defaultDTO.dtoType === DTOType.matrix) {
        const rows = Object.keys(problem.entities[defaultDTO.fromEntity].refsToIdx).length
        const columns = Object.keys(problem.entities[defaultDTO.toEntity].refsToIdx).length

        return zeros([rows, columns])
      } else if (defaultDTO.dtoType === DTOType.vector) {
        const items = Object.keys(problem.entities[defaultDTO.entity].refsToIdx).length
        return zeros([items])
      } else {
        return 0
      }
    }
  }
}