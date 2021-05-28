import {v5 as uuidv5} from 'uuid'
import {DTO} from "../interface/dto.interface";
import {ConfigTree} from "../tree";
import {ProblemInstance} from "../interface/problem.interface";
import {readJsonCache, writeJsonCache} from "./fs.utils";
import {CONFIG} from "../config";

const namespace = "75f44667-7713-4be2-9130-2c090b8f2ff3"

const CACHE_TYPES = ["pearsonSimilarity"]

export const readCache = (problemInstance: ProblemInstance, config: ConfigTree) => {
  if (CONFIG.ENABLE_CACHE) {
    if (CACHE_TYPES.includes(config.config.type)) {
      return readJsonCache(hash(problemInstance, config))
    }
  }
  // if cache exists, return,
  // else: execute function, cache output and return result
}

export const writeCache = (problemInstance: ProblemInstance, config: ConfigTree, result: DTO) => {
  if (CONFIG.ENABLE_CACHE) {
    if (CACHE_TYPES.includes(config.config.type)) {
      return writeJsonCache(hash(problemInstance, config), result)
    }
  }
}

const hash = (problemInstance: ProblemInstance, config: ConfigTree) => {
  const toHash = `${problemInstance.problemName}|${problemInstance.interleaveSize}|${problemInstance.interleaveSeed}|${JSON.stringify(config)}`
  return uuidv5(toHash, namespace)
}