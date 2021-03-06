import {CONFIG} from "../config";
import {calcRecursive} from "../evaluate";
import {getTerminals} from "../terminals/terminal";
import {Functions} from "../functions/function";
import {generateTree, generateTreeTables} from "../tree";
import {readSobazaar} from "../problems/sobazaar.problem";
import {fitnessScore} from "../fitness";

const test = async () => {
  const problem = await readSobazaar(0.1)


  const functions = Functions
  const terminals = getTerminals(problem)

  const treeTablesGrowth = generateTreeTables(terminals, functions, 4, true)
  const newConfig = generateTree(problem.output, treeTablesGrowth, terminals, functions, CONFIG.MAX_DEPTH, true)

  const res = calcRecursive(newConfig, problem)
  const fitness = fitnessScore(res, problem)
  console.log(fitness)
}

test()