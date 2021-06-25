import {CONFIG} from "../config";
import {ConfigTree} from "../tree";
import {DTO, DTOType} from "../interface/dto.interface";

const EMPTY = 0
const BRANCH = 1
const BRANCH_END = 2
const PIPE = 3

const BRANCH_ASCII = "├── "
const BRANCH_END_ASCII = "└── "
const PIPE_ASCII = "│   "
const EMPTY_ASCII = "    "

const END_MAP = {
  [BRANCH]: BRANCH_ASCII,
  [BRANCH_END]: BRANCH_END_ASCII
}

const INT_MAP = {
  [BRANCH]: PIPE_ASCII,
  [BRANCH_END]: EMPTY_ASCII
}

export const printNested = (depth: number[], str: string, print = CONFIG.DEBUG_MODE) => {
  const prefix = depth.map((it, idx) => {
    if (idx === depth.length - 1) {
      return END_MAP[it]
    } else {
      return INT_MAP[it]
    }
  }).join("");

  if (print) {
    console.log(`${prefix}${str}`);
  }
};

export const printConfig = (config: ConfigTree, depth = []) => {
  const {type, ...strippedConfig} = config.config
  delete strippedConfig["output"]
  const strType = config.config.type
  const strConfig = Object.keys(strippedConfig).length > 0 ? JSON.stringify(strippedConfig) : ""

  printNested(depth, `${strType} ${strConfig}`, true)

  config.input.forEach((it, idx) => printConfig(
    it,
    [...depth, config.input.length - idx > 1 ? BRANCH : BRANCH_END]
  ))
}

export const dtoToString = (dto: DTO) => {
  if (dto.dtoType === DTOType.matrix) {
    return `matrix[${dto.fromEntity},${dto.toEntity}]`
  } else if (dto.dtoType === DTOType.vector) {
    return `vector<${dto.valueType}>[${dto.entity}]`
  } else {
    return `scalar`
  }
}