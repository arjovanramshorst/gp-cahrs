import {readJson} from "./utils/fs.utils";
import {printConfig} from "./utils/display.utils";
import {CONFIG} from "./config";
import {readMovieLensV2} from "./problems/movielens-auxiliary.problem";
import {fitnessScore} from "./fitness";
import {calcRecursive} from "./evaluate";
import {FUNCTIONS} from "./utils/trial.utils";
import {ConfigTree, fun} from "./tree";

const main = async () => {
  const configs = await getConfigs()

  const problem = await readMovieLensV2(1, CONFIG.VERIFICATION_SEED)

  configs.forEach(([name, it]) => {
    console.log(`\n===================\n ${name}:\n===================`)
    printConfig(it)
    const baselineFitness = fitnessScore(
      calcRecursive(it, problem),
      problem
    ).raw;

    console.log("MRR: ", baselineFitness.mrr)
  })
}

const getConfigs = async (): Promise<[string, ConfigTree][]> => {
  return [
    // ['recent', await readJson("../src/pretty.json")],
    ['popularity', popularity],
    ['basic CF', basicCF],
    ['empty', empty],
    ['Item CF', itemCF],
    ['CF + popular', cfPlusPopular],
    // ['Director', director],
    // ['Actors', actors],
    // ['Genres', genres],
  ]
}

const f = FUNCTIONS

const popularity = f.addVector()([
  f.fillMatrix('user', 'movie', 0),
  f.popularity()([
    f.interaction('rating')])])

const basicCF = f.nearestNeighbour(15)([
  f.pearson()([
    f.interaction('rating')]),
  f.interaction('rating')])

const itemCF = f.invertedNN(15)([
  f.pearson()([
    f.transpose()([
      f.interaction('rating')])]),
  f.interaction('rating')])

const empty = f.fillMatrix('user', 'movie', 0)

const cfPlusPopular = f.sum(0.5)([
  basicCF,
  popularity])

const director = f.invertedNN(10)([
  f.compareString()([
    f.property('movie', 'director'),
    f.property('movie', 'director')]),
  f.interaction('rating')])

const actors = f.invertedNN(10)([
  f.compareArray()([
    f.property('movie', 'actors'),
    f.property('movie', 'actors')]),
  f.interaction('rating')])

const genres = f.invertedNN(10)([
  f.compareArray()([
    f.property('movie', 'genres'),
    f.property('movie', 'genres')]),
  f.interaction('rating')])

main()
