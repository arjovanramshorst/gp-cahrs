import { CONFIG } from './default.config';
import { calcRecursive } from './evaluate';
import { Functions } from './functions/function';
import { readMovieLens } from './problems/movielens.problem';
import { getTerminals } from './terminals/terminal';
import { generateTree, generateTreeTables } from './tree';

const main = async () => {

  const problem = await readMovieLens()

  const functions = Functions
  const terminals = getTerminals(problem)

  const treeTablesGrowth = generateTreeTables(terminals, functions, 3, true)
  const treeTablesFull = generateTreeTables(terminals, functions, 3, false)

  const treeGrowth = generateTree(problem.output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, true)
  const treeFull = generateTree(problem.output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, false)

  console.log("GROWTH:")
  console.log(treeTablesGrowth)

  console.log("\n\nFULL:")
  console.log(treeTablesFull)

  console.log("\n\nGROW TREE:")
  console.log(JSON.stringify(treeGrowth, null, 2))

  console.log("\n\nFULL TREE:")
  console.log(JSON.stringify(treeFull, null, 2))

  const res = calcRecursive(treeGrowth, problem)
  console.log("\nResult:")
  console.log(res)
}

main()