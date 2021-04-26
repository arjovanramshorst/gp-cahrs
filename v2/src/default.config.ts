
export const CONFIG = {
  GENERATION_SIZE: 40,
  GENERATIONS: 40,
  GROWTH_FUNCTION_FRACTION: 0.5,
  MAX_DEPTH: 4,
  INTERLEAVE_SIZE: 0.1,
  REPRODUCTION: {
    TOURNAMENT_SIZE: 4
  },
  DEBUG_MODE: process.env.CAHRS_DEBUG_MODE !== "false",
  NODES: {
    SCALAR: {
      MAX: 5
    }
  }
}
console.log(CONFIG)