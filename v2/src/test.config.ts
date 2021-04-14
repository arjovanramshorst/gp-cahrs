import {ConfigTree, generateTree, generateTreeTables} from "./tree";
import {readMovieLens} from "./problems/movielens.problem";
import {calcRecursive} from "./evaluate";
import {fitnessScore} from "./fitness";
import {Functions} from "./functions/function";
import {getTerminals} from "./terminals/terminal";
import {CONFIG} from "./default.config";
import {DTO, DTOType} from "./interface/dto.interface";
import {readJson} from "./utils/fs.utils";

export const configTest1 = `{"config":{"type":"multiply"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"multiply"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"multiply"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"sum"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"subtract"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"randomScalar","scalar":8},"output":{"dtoType":"scalar"},"input":[]},{"config":{"type":"randomScalar","scalar":1},"output":{"dtoType":"scalar"},"input":[]}]},{"config":{"type":"subtract"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"multiply"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"randomScalar","scalar":4},"output":{"dtoType":"scalar"},"input":[]},{"config":{"type":"randomScalar","scalar":4},"output":{"dtoType":"scalar"},"input":[]}]},{"config":{"type":"randomScalar","scalar":5},"output":{"dtoType":"scalar"},"input":[]}]}]},{"config":{"type":"randomMatrix","output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"seed":742085764},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[]}]},{"config":{"type":"compareNumber"},"output":{"dtoType":"matrix","fromEntity":"user","toEntity":"movie","rows":610,"columns":9742},"input":[{"config":{"type":"randomVector","output":{"dtoType":"vector","entity":"user","items":610,"valueType":"number"},"seed":2112209989},"output":{"dtoType":"vector","entity":"user","items":610,"valueType":"number"},"input":[]},{"config":{"type":"randomVector","output":{"dtoType":"vector","entity":"movie","items":9742,"valueType":"number"},"seed":156248497},"output":{"dtoType":"vector","entity":"movie","items":9742,"valueType":"number"},"input":[]}]}]},{"config":{"type":"subtract"},"output":{"dtoType":"scalar"},"input":[{"config":{"type":"randomScalar","scalar":1},"output":{"dtoType":"scalar"},"input":[]},{"config":{"type":"randomScalar","scalar":1},"output":{"dtoType":"scalar"},"input":[]}]}]}`

const test = async (config: ConfigTree) => {
  const problem = await readMovieLens()
  const res = calcRecursive(config, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

const testRecent = async () => {
  const problem = await readMovieLens()
  const config = readJson("most_recent.json")
  const res = calcRecursive(config, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

const testTree = async (output: DTO) => {
  const problem = await readMovieLens()

  const functions = Functions
  const terminals = getTerminals(problem)

  const treeTablesGrowth = generateTreeTables(terminals, functions, 3, true)
  const newConfig = generateTree(output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, true)
  const res = calcRecursive(newConfig, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

testRecent()

// testTree({
//   dtoType: DTOType.matrix,
//   fromEntity: "user",
//   rows: 610
// })
// test(JSON.parse(configTest1))