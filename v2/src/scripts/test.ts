import {ConfigTree, generateTree, generateTreeTables} from "../tree";
import {readMovieLensV2} from "../problems/movielens-auxiliary.problem";
import {getTerminals} from "../terminals/terminal";
import {Functions} from "../functions/function";
import {FUNCTIONS} from "../utils/trial.utils";
import {pearsonCorrelation} from "../functions/similarity.function";
import {fitnessScore} from "../fitness";
import {CONFIG} from "../config";
import {getMutateFunction, produceOffspring} from "../reproduce";
import {calcRecursive} from "../evaluate";
import {readJson, writeFile} from "../utils/fs.utils";
import {DTO} from "../interface/dto.interface";
import {hash} from "../utils/cache.utils";

export const configTest1 = `{"config":{"type":"multiply"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"multiply"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"multiply"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"sum"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"subtract"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"randomScalar","scalar":8},"output":{"dtoType":"scalar"},"input":[]},{"config":{"type":"randomScalar","scalar":1},"output":{"dtoType":"scalar"},"input":[]}]},{"config":{"type":"subtract"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"multiply"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"randomScalar","scalar":4},"output":{"dtoType":"scalar"},"input":[]},{"config":{"type":"randomScalar","scalar":4},"output":{"dtoType":"scalar"},"input":[]}]},{"config":{"type":"randomScalar","scalar":5},"output":{"dtoType":"scalar"},"input":[]}]}]},{"config":{"type":"randomMatrix","output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"seed":742085764},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[]}]},{"config":{"type":"compareNumber"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"randomVector","output":{"dtoType":"vector","entity":"user","items":610,"valueType":"number"},"seed":2112209989},"output":{"dtoType":"vector","entity":"user","items":610,"valueType":"number"},"input":[]},{"config":{"type":"randomVector","output":{"dtoType":"vector","entity":"movie","items":9742,"valueType":"number"},"seed":156248497},"output":{"dtoType":"vector","entity":"movie","items":9742,"valueType":"number"},"input":[]}]}]},{"config":{"type":"subtract"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"randomScalar","scalar":1},"output":{"dtoType":"scalar"},"input":[]},{"config":{"type":"randomScalar","scalar":1},"output":{"dtoType":"scalar"},"input":[]}]}]}`

const test = async (config: ConfigTree) => {
  const problem = await readMovieLensV2(1)
  const res = calcRecursive(config, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

const testRecent = async () => {
  const problem = await readMovieLensV2(0.1)
  const config = readJson("most_recent.json")
  const res = calcRecursive(config, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

const testRecentTest = async () => {
  const problem = await readMovieLensV2()
  const config = readJson("most_recent_test.json")
  const res = calcRecursive(config, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

const testTreeGeneration = async () => {
  const problem = await readMovieLensV2()
  const functions = Functions
  const terminals = getTerminals(problem)
  const treeTablesGrowth = generateTreeTables(terminals, functions, CONFIG.MAX_DEPTH, true)
  let generation = []
  for (let i = 0; i < 40; i++) {
    generation.push(generateTree(problem.output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, true))
  }
  while (true) {
    const mutateFn = getMutateFunction(treeTablesGrowth, terminals, functions)

    const evaluated = generation.map(it => ({
      config: it,
      fitness: Math.random()
    }))

    generation = produceOffspring(evaluated, mutateFn)
  }
}

const testTree = async (output?: DTO) => {
  const problem = await readMovieLensV2()

  const functions = Functions
  const terminals = getTerminals(problem)

  const treeTablesGrowth = generateTreeTables(terminals, functions, 3, true)
  const newConfig = generateTree(output ?? problem.output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, true)
  writeFile("most_recent_test.json", JSON.stringify(newConfig))
  const res = calcRecursive(newConfig, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

/**
 * Test most recent
 */
// testRecent()

/**
 * Test tree generation
 */
// testTreeGeneration()

/**
 * Test specific tree
 */
// testTree({
//   dtoType: DTOType.matrix,
//   fromEntity: "user",
//   rows: 610
// })

/**
 * Test random tree based on problem
 */
// testTree()

// testRecentTest()
const f = FUNCTIONS
const testCorrelation = async () => {
  console.log(`${pearsonCorrelation([NaN, 0, 0], [0, 0, 0])}`)
  const problem = await readMovieLensV2()
  //
  const test = f.pearson()([
    f.transpose()([
      f.interaction('acts')])])

  console.log(`Hash: ${hash(problem, test)}`)
  findNaN(calcRecursive(test, problem))

  console.log("asdf")
  // const correlation = pearsonCorrelation(interactions[0], interactions[1])
  // console.log(`${pearsonCorrelation([0, 0, 0], [0, 0, 0])}`)
  // console.log(`${pearsonCorrelation([1, 0, 0], [1, 0, 0])}`)
  // console.log(`${pearsonCorrelation([1, 0, 0], [0, 1, 0])}`)
  // console.log(`${pearsonCorrelation([1, 0, 0, 0], [1, 1, 0, 0])}`)
  // console.log(`${pearsonCorrelation([1, 0, 0, 0], [1, 1, 1, 0])}`)
}

const findNaN = (matrix: number[][]) => {
  matrix.forEach((row, rowIdx) => {
    row.forEach((val, valIdx) => {
      if (isNaN(val)) {
        console.log(`FOUND NAN, ${rowIdx}-${valIdx}`)
      }
    })
  })
}

testCorrelation()
// test(bestConfig as ConfigTree)
// test(JSON.parse(configTest1))