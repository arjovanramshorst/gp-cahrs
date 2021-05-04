import {readSobazaar} from "./problems/sobazaar.problem";
import {readMovieLens} from "./problems/movielens.problem";
import {ReadProblemFunction} from "./interface/problem.interface";

const getProblem = (): { read: ReadProblemFunction, name: string } => {
  switch(process.env.CAHRS_PROBLEM) {
    case "sobazaar":
      return {
        read: readSobazaar,
        name: "Sobazaar",
      }
    case "movielens":
    default:
      return {
        read: readMovieLens,
        name: "Movielens"
      }
  }
}


export const CONFIG = {
  PROBLEM: getProblem(),
  GENERATION_SIZE: 40,
  GENERATIONS: 40,
  GROWTH_FUNCTION_FRACTION: 0.5,
  MAX_DEPTH: 4,
  INTERLEAVE_SIZE: 0.1,
  REPRODUCTION: {
    TOURNAMENT_SIZE: 4
  },
  NORMALIZE: process.env.CAHRS_NORMALIZE === "true", // default false
  DEBUG_MODE: process.env.CAHRS_DEBUG_MODE !== "false", // default true
  NODES: {
    SCALAR: {
      MAX: 5
    }
  }
}
