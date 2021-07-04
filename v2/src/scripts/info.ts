import {ConfigTree} from "../tree";
import {readMovieLensV2} from "../problems/movielens-auxiliary.problem";
import {calcRecursive} from "../evaluate";
import {fitnessScore} from "../fitness";
import {ProblemInstance} from "../interface/problem.interface";
import {readFilmTrust} from "../problems/filmtrust.problem";
import {readSobazaar} from "../problems/sobazaar.problem";

const print = (problem: ProblemInstance) => {
  console.log(problem.problemName)
  console.log("entities:")
  Object.keys(problem.entities).forEach(entity => {
    console.log(`${entity}: ${Object.keys(problem.entities[entity].refsToIdx).length}`)
  })
  console.log("interactions:")
  Object.keys(problem.interactions).forEach(interaction => {
    const numInteractions = problem.interactions[interaction].interactions.reduce((sum, it) => sum + it.reduce((innerSum, innerIt) => innerSum + (innerIt > 0 ? 1 : 0), 0), 0)
    console.log(`${interaction}: ${numInteractions}`)
  })
}

const main = async () => {
  // print(await readMovieLensV2(1))
  // print(await readFilmTrust(1))
  print(await readSobazaar())
  print(await readSobazaar(undefined, undefined, undefined, "sparse"))
  print(await readSobazaar(undefined, undefined, 'product_detail_clicked', "dense"))
}

main()