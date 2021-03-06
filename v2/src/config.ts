import {readSobazaar} from "./problems/sobazaar.problem";
import {ReadProblemFunction} from "./interface/problem.interface";
import {readMovieLensV2} from "./problems/movielens-auxiliary.problem";
import {readYelp} from "./problems/yelp.problem";
import {readFilmTrust} from "./problems/filmtrust.problem";

const getProblem = (): { read: ReadProblemFunction, name: string } => {
  switch(process.env.CAHRS_PROBLEM) {
    case "sobazaar":
      return {
        read: readSobazaar,
        name: "sobazaar",
      }
    case "sobazaar-dense":
      return {
        read: (size, seed, interaction) => readSobazaar(size, seed, interaction, "dense"),
        name: "sobazaar-dense"
      }
    case "sobazaar-sparse":
      return {
        read: (size, seed, interaction) => readSobazaar(size, seed, interaction, "sparse"),
        name: "sobazaar-sparse"
      }
    case "yelp":
      return {
        read: readYelp,
        name: "yelp"
      }
    case "filmtrust":
      return {
        read: readFilmTrust,
        name: "filmtrust"
      }
    case "movielens":
    default:
      return {
        read: readMovieLensV2,
        name: "movielens"
      }
  }
}

export const CONFIG = {
  EXPERIMENT_NAME: process.env.CAHRS_EXPERIMENT_NAME ?? null,
  PROBLEM: getProblem(),
  RECOMMEND_INTERACTION: process.env.CAHRS_RECOMMEND_INTERACTION,
  GENERATION_SIZE: process.env.CAHRS_GENERATION_SIZE ? Number(process.env.CAHRS_GENERATION_SIZE) : 100,
  GENERATIONS: process.env.CAHRS_GENERATIONS ? Number(process.env.CAHRS_GENERATIONS) : 10,

  GROWTH_FUNCTION_FRACTION: 0.5,

  MAX_DEPTH: process.env.CAHRS_MAX_DEPTH ? Number(process.env.CAHRS_MAX_DEPTH) : 5,
  INITIAL_DEPTH: process.env.CAHRS_INITIAL_DEPTH ? Number(process.env.CAHRS_INITIAL_DEPTH) : 5,


  INTERLEAVE_SIZE: process.env.CAHRS_INTERLEAVE_SIZE ? Number(process.env.CAHRS_INTERLEAVE_SIZE) : 1,

  REPRODUCTION: {
    EVALUATION: process.env.CAHRS_EVALUATION ?? 'mrr',
    TOURNAMENT_SIZE: process.env.CAHRS_TOURNAMENT_SIZE ? Number(process.env.CAHRS_TOURNAMENT_SIZE) : 4,
    MUTATION_RATE: process.env.CAHRS_MUTATION_RATE ? Number(process.env.CAHRS_MUTATION_RATE) : 0,
    PARAM_MUTATION_RATE: process.env.CAHRS_PARAM_MUTATION_RATE ? Number(process.env.CAHRS_PARAM_MUTATION_RATE) : 0.9,
    PARAM_MUTATION_SPEED: process.env.CAHRS_PARAM_MUTATION_SPEED ? Number(process.env.CAHRS_PARAM_MUTATION_SPEED) : 0.5,
    CROSSOVER_RATE: process.env.CAHRS_CROSSOVER_RATE ? Number(process.env.CAHRS_CROSSOVER_RATE) : 1,
    ELITISM: process.env.CAHRS_ELITISM ? Number(process.env.CAHRS_ELITISM) : 0
  },
  VERIFICATION_SEED: 1751426601,
  NORMALIZE: process.env.CAHRS_NORMALIZE === "true", // default false
  DEBUG_MODE: process.env.CAHRS_DEBUG === "true", // default false
  NODES: {
    SCALAR: {
      MAX: 5
    }
  },
  ONLY_BASELINE: process.env.CAHRS_ONLY_BASELINE === "true", // default false,
  ENABLE_CACHE: process.env.CAHRS_ENABLE_CACHE === "true",
  CACHE_DIRECTORY: process.env.CAHRS_CACHE_DIRECTORY ?? "./cache/"
}
