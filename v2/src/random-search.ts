import {generateTree, generateTreeTables} from "./tree";
import {CONFIG} from "./config";
import {readMovieLensV2} from "./problems/movielens-auxiliary.problem";
import {printConfig} from "./utils/display.utils";
import {fitnessScore, FitnessValue} from "./fitness";
import {calcRecursive} from "./evaluate";
import {Functions} from "./functions/function";
import {getTerminals} from "./terminals/terminal";
import {DTOType} from "./interface/dto.interface";

const main = async () => {

  const problem = await readMovieLensV2(1, CONFIG.VERIFICATION_SEED)

  const functions = Functions;
  const terminals = getTerminals(problem);

  const treeTablesGrowth = generateTreeTables(
    terminals,
    functions,
    CONFIG.MAX_DEPTH,
    true
  );

  let best: FitnessValue
  let i = 0;

  while(true) {
    const config = generateTree(
      problem.output,
      treeTablesGrowth,
      terminals,
      functions,
      CONFIG.MAX_DEPTH,
      true
    )
    try {
      console.log(`Evaluating #${i}`)
      printConfig(config)
      // const fitness = fitnessScore(
      //   calcRecursive(config, problem),
      //   problem
      // ).raw;
      // console.log(`Evaluated #${i}, MRR: ${fitness.performance}`)
      // if (!best || fitness.performance > best.performance) {
      //   best = fitness
      //   console.log(`Found improvement after ${i} tries, MRR: ${fitness.performance}`)
      //   printConfig(config)
      //   console.log(JSON.stringify(config))
      // }
      i++
    } catch(e) {
      console.log(e)
      printConfig(config)
      console.log(JSON.stringify(config))
    }
  }
}

main()
