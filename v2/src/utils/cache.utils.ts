import {v5 as uuidv5} from 'uuid'
import {ConfigTree} from "../tree";
import {ProblemInstance} from "../interface/problem.interface";
import {readFSCache, writeFSCache} from "./fs.utils";
import {CONFIG} from "../config";

const namespace = "75f44667-7713-4be2-9130-2c090b8f2ff3"

const CACHE_TYPES = ["pearsonSimilarity"]

export const readCache = <T>(problemInstance: ProblemInstance, config: ConfigTree): T => {
  if (CACHE_TYPES.includes(config.config.type)) {
    return readFSCache(hash(problemInstance, config))
  }
  // if cache exists, return,
  // else: execute function, cache output and return result
}

export const writeCache = <T>(problemInstance: ProblemInstance, config: ConfigTree, result: T) => {
  if (CONFIG.ENABLE_CACHE) {
    if (CACHE_TYPES.includes(config.config.type)) {
      return writeFSCache(hash(problemInstance, config), result)
    }
  }
}

export const hash = (problemInstance: ProblemInstance, config: ConfigTree) => {
  // TODO: Make generic
  const toHash = [
    problemInstance.problemName,
    problemInstance.interleaveSize,
    problemInstance.interleaveSize === 1 ? "" : problemInstance.interleaveSeed,
    problemInstance.problemName.startsWith("sobazaar") ? CONFIG.RECOMMEND_INTERACTION : null,
    JSON.stringify(config)
  ].filter( it => it !== null)
    .join("|")
  // const toHash = `${problemInstance.problemName}|${problemInstance.interleaveSize}|${problemInstance.interleaveSize === 1 ? "" : problemInstance.interleaveSeed}|${JSON.stringify(config)}`
  return uuidv5(toHash, namespace)
}