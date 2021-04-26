import {CONFIG} from './default.config';
import {calcRecursive} from './evaluate';
import {Functions} from './functions/function';
import {readMovieLens} from './problems/movielens.problem';
import {getTerminals} from './terminals/terminal';
import {ConfigTree, generateTree, generateTreeTables} from './tree';
import {fitnessScore} from "./fitness"
import {appendFile, writeFile} from "./utils/fs.utils";
import {EvaluatedConfig, produceOffspring} from "./reproduce";
import {DTO} from "./interface/dto.interface";
import {printConfig} from "./utils/display.utils";

const filename = `Run_${new Date().toISOString()}_${CONFIG.GENERATION_SIZE}_${CONFIG.GENERATIONS}.csv`

const main = async () => {

  const problem = await readMovieLens(CONFIG.INTERLEAVE_SIZE)

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
    const sampledProblem = await readMovieLens(CONFIG.INTERLEAVE_SIZE)
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
  return configs.map((config, idx) => {
    const key = JSON.stringify(config)
    console.log(`Evaluating generation #${gen} RS ${idx}:`)
    printConfig(config)
    writeFile("most_recent.json", JSON.stringify(config))
    let fitness
    if (cache[key]){
      console.log("Using cache..")
      fitness = cache[key]
    } else {
      const res = calcRecursive(config, problem)
      fitness = fitnessScore(res, problem)
      cache[JSON.stringify(config)] = fitness
    }

    const str = `${gen}\t${idx}\t${fitness.fScore}\t${fitness.recall}\t${fitness.precision}\t${JSON.stringify(config)}\n`;
    appendFile(filename, str)

    console.log(`Evaluating generation #${gen} RS ${idx} - DONE (${fitness.performance})`)
    return {
      config,
      fitness: fitness.performance
    }
  })
}

main()