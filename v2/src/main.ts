import {CONFIG} from './config';
import {calcRecursive} from './evaluate';
import {Functions} from './functions/function';
import {readMovieLens} from './problems/movielens.problem';
import {getTerminals} from './terminals/terminal';
import {ConfigTree, generateTree, generateTreeTables} from './tree';
import {fitnessScore, Score} from "./fitness"
import {appendFile, writeFile} from "./utils/fs.utils";
import {EvaluatedConfig, produceOffspring} from "./reproduce";
import {DTO} from "./interface/dto.interface";
import {printConfig} from "./utils/display.utils";
import {csvHeader, produceCsvLine} from "./utils/output.utils";

const filename = `${CONFIG.PROBLEM.name}_${new Date().toISOString()}_${CONFIG.GENERATION_SIZE}_${CONFIG.GENERATIONS}.csv`

const main = async (readProblem = readMovieLens) => {

  appendFile(filename, csvHeader)
  /*************************************************************************
   *************************************************************************
   *************************************************************************
   * TODO: Replace multiply by "scale",
   *************************************************************************
   *************************************************************************
   *************************************************************************
   */

  const problem = await readProblem(CONFIG.INTERLEAVE_SIZE)

  const functions = Functions
  const terminals = getTerminals(problem)

  const treeTablesGrowth = generateTreeTables(terminals, functions, CONFIG.MAX_DEPTH, true)
  const treeTablesFull = generateTreeTables(terminals, functions, CONFIG.MAX_DEPTH, false)

  console.log("Generating initial population")
  let generation = []
  for (let i = 0; i < CONFIG.GENERATION_SIZE / 2; i++) {
    generation.push(generateTree(problem.output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, true))
    generation.push(generateTree(problem.output, treeTablesFull, terminals, functions, CONFIG.MAX_DEPTH, false))
  }


  console.log("Generating initial population - DONE")
  for (let gen = 0; gen < CONFIG.GENERATIONS; gen++) {
    console.log(`Sampling dataset for generation #${gen}`)
    const sampledProblem = await readProblem(CONFIG.INTERLEAVE_SIZE)
    console.log(`Sampling dataset for generation #${gen} - DONE`)

    const treeTablesGrowth = generateTreeTables(terminals, functions, CONFIG.MAX_DEPTH, true)

    const mutateFn = (output: DTO, maxDepth: number) =>
      generateTree(output, treeTablesGrowth, terminals, functions, maxDepth, true)

    console.log(`Evaluating generation #${gen}`)
    const evaluated = evaluateGeneration(gen, generation, sampledProblem)
    console.log(`Evaluating generation #${gen} - DONE`)

    console.log(`Producing generation #${gen + 1}`)
    generation = produceOffspring(evaluated, mutateFn)
    console.log(`Producing generation #${gen + 1} - DONE`)
  }
}

const evaluateGeneration = (gen: number, configs: ConfigTree[], problem): EvaluatedConfig[] => {
  const cache = {}
  console.log(`Evaluating generation #${gen} Baseline`)
  const baselineFitness = fitnessScore(calcRecursive(problem.baseline, problem), problem).raw
  console.log(`Evaluating generation #${gen} Baseline - DONE (${baselineFitness.performance})`)

  const str = produceCsvLine(`${gen}`, "baseline", baselineFitness, baselineFitness, problem.baseline)
  appendFile(filename, str)

  return configs.map((config, idx) => {
    const key = JSON.stringify(config)
    console.log(`Evaluating generation #${gen} RS ${idx}:`)
    printConfig(config)
    writeFile("most_recent.json", JSON.stringify(config))
    let fitness: Score
    if (cache[key]){
      console.log("Using cache..")
      fitness = cache[key]
    } else {
      const res = calcRecursive(config, problem)
      fitness = fitnessScore(res, problem, baselineFitness)
      cache[JSON.stringify(config)] = fitness
    }

    const str = produceCsvLine(`${gen}`, `${idx}`, fitness.raw, fitness.normalized, config);

    appendFile(filename, str)

    const score = CONFIG.NORMALIZE ? fitness.normalized.performance : fitness.raw.performance
    console.log(`Evaluating generation #${gen} RS ${idx} - DONE (${score})`)
    return {
      config,
      fitness: score
    }
  })
}

main(CONFIG.PROBLEM.read)