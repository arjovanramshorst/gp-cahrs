import {CONFIG} from './default.config';
import {calcRecursive} from './evaluate';
import {Functions} from './functions/function';
import {readMovieLens} from './problems/movielens.problem';
import {getTerminals} from './terminals/terminal';
import {ConfigTree, generateTree, generateTreeTables} from './tree';
import {fitnessScore} from "./fitness"
import {appendFile, writeFile} from "./utils/fs.utils";
import {EvaluatedConfig, mutateConfigTree, produceOffspring} from "./reproduce";
import {DTO} from "./interface/dto.interface";

const filename = `Run_${new Date().toISOString()}_${CONFIG.GENERATION_SIZE}_${CONFIG.GENERATIONS}.csv`

const main = async () => {

  const problem = await readMovieLens()

  const functions = Functions
  const terminals = getTerminals(problem)

  const treeTablesGrowth = generateTreeTables(terminals, functions, 3, true)
  const treeTablesFull = generateTreeTables(terminals, functions, 3, false)

  console.log("Generating initial population")
  let generation = []
  for (let i = 0; i < CONFIG.GENERATION_SIZE / 2; i++) {
    generation.push(generateTree(problem.output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, true))
    generation.push(generateTree(problem.output, treeTablesFull, terminals, functions, CONFIG.MAX_DEPTH, false))
  }

  const mutateFn = (output: DTO, maxDepth: number) =>
    generateTree(output, treeTablesGrowth, terminals, functions, maxDepth, true)

  console.log("Generating initial population - DONE")
  for (let gen = 0; gen < CONFIG.GENERATIONS; gen++) {
    console.log(`Evaluating generation #${gen}`)
    const evaluated = evaluateGeneration(gen, generation, problem)
    console.log(`Evaluating generation #${gen} - DONE`)

    console.log(`Producing generation #${gen + 1}`)
    generation = produceOffspring(evaluated, mutateFn)
    console.log(`Producing generation #${gen + 1} - DONE`)
  }
}

const evaluateGeneration = (gen: number, configs: ConfigTree[], problem): EvaluatedConfig[] => {
  return configs.map((config, idx) => {
    console.log(`Evaluating generation #${gen} RS ${idx}`)
    writeFile("most_recent.json", JSON.stringify(config))
    const res = calcRecursive(config, problem)
    const fitness = fitnessScore(res, problem)

    const str = `${gen};${idx};${fitness.fScore};${fitness.recall};${fitness.precision};${JSON.stringify(config)}\n`;
    appendFile(filename, str)

    console.log(`Evaluating generation #${gen} RS ${idx} - DONE (${fitness.performance})`)
    return {
      config,
      fitness: fitness.performance
    }
  })
}

main()