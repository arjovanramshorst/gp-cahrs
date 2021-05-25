import {CONFIG} from "../config";
import {ConfigTree} from "../tree";
import {DTO, DTOType} from "../interface/dto.interface";

export const printNested = (depth: number, str: string, print = CONFIG.DEBUG_MODE) => {
  const prefix = [...Array(depth)].map((it) => "  ").join("");

  if (print) {
    console.log(`${prefix}${str}`);
  }
};

export const printConfig = (config: ConfigTree, depth = 0) => {
  const { type, ...strippedConfig } = config.config
  delete strippedConfig["output"]
  const str = `${config.config.type} ${JSON.stringify(strippedConfig)}`//: ${dtoToString(config.output)}`
  printNested(depth,  str,true)
  config.input.forEach(it => printConfig(it, depth + 1))
}

export const dtoToString = (dto: DTO) => {
  if (dto.dtoType === DTOType.matrix) {
    return `matrix[${dto.rows},${dto.columns}]`
  } else if (dto.dtoType === DTOType.vector) {
    return `vector<${dto.valueType}>[${dto.items}]`
  } else {
    return `scalar`
  }
}