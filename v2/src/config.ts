import {readSobazaar} from "./problems/sobazaar.problem";
import {readMovieLens} from "./problems/movielens.problem";
import {ReadProblemFunction} from "./interface/problem.interface";
import {readMovieLensV2} from "./problems/movielens-auxiliary.problem";

const getProblem = (): { read: ReadProblemFunction, name: string } => {
  switch(process.env.CAHRS_PROBLEM) {
    case "sobazaar":
      return {
        read: readSobazaar,
        name: "Sobazaar",
      }
    case "movielens":
      return {
        read: readMovieLens,
        name: "Movielens"
      }
    case "movielens2":
    default:
      return {
        read: readMovieLensV2,
        name: "Movielens V2"
      }
  }
}


export const CONFIG = {
  EXPERIMENT_NAME: process.env.CAHRS_EXPERIMENT_NAME ?? null,
  PROBLEM: getProblem(),
  GENERATION_SIZE: process.env.CAHRS_GENERATION_SIZE ? Number(process.env.CAHRS_GENERATION_SIZE) : 40,
  GENERATIONS: process.env.CAHRS_GENERATIONS ? Number(process.env.CAHRS_GENERATIONS) : 40,
  GROWTH_FUNCTION_FRACTION: 0.5,
  MAX_DEPTH: process.env.CAHRS_MAX_DEPTH ? Number(process.env.CAHRS_MAX_DEPTH) : 4,
  INTERLEAVE_SIZE: process.env.CAHRS_INTERLEAVE_SIZE ? Number(process.env.CAHRS_INTERLEAVE_SIZE) : 0.1,
  REPRODUCTION: {
    TOURNAMENT_SIZE: 4
  },
  VERIFICATION_SEED: 1751426601,
  NORMALIZE: process.env.CAHRS_NORMALIZE === "true", // default false
  DEBUG_MODE: process.env.CAHRS_DEBUG === "true", // default false
  NODES: {
    SCALAR: {
      MAX: 5
    }
  },
  ONLY_BASELINE: process.env.CAHRS_ONLY_BASELINE === "true" // default false
}
