import { Functions } from './functions/function';
import { readMovieLens } from './problems/movielens.problem';
import { getTerminals } from './terminals/terminal';
import { generateTreeTables } from './tree';

const main = async () => {

  const problem = await readMovieLens()

  const functions = Functions
  const terminals = getTerminals(problem)

  const treeTablesGrowth = generateTreeTables(terminals, functions, 3, true)
  const treeTablesFull = generateTreeTables(terminals, functions, 3, false)

  console.log("GROWTH:")
  console.log(treeTablesGrowth)

  console.log("\n\nFULL:")
  console.log(treeTablesFull)
}

main()