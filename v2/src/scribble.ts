import {zeros} from "mathjs"
import {DTOType} from "./interface/dto.interface";
import {RandomMatrix, RandomVector} from "./terminals/fill.terminal";
import {generateMulberrySeed} from "./utils/random.utils";
import {NNConfig, NNRecommendFunction} from "./functions/cf.function";
import {PropertyType} from "./interface/problem.interface";
import {generateTree} from "./tree";
import {PearsonSimilarityFunction} from "./functions/similarity.function";

const measure = (times: number, fn: () => void) => {
  const t = Date.now();

  for (let i = 0; i < times; i++) {
    fn();
  }
  const tFinished = Date.now();
  console.log(`Time ran is ${tFinished - t}`);
};

// measure(600, () => pearsonCorrelation(a, b))

const mathZeros = (size) => zeros([size, size])
const empty = (size) => {
  const res = []
  for (let i = 0; i < size; i++) {
    res.push([])
    for (let j = 0; j < size; j++) {
      res[i].push(0)
    }
  }
}

const createVector = (size: number) =>
  RandomVector.evaluate({
    output: {dtoType: DTOType.vector, items: size, valueType: PropertyType.number},
    seed: generateMulberrySeed()
  }, undefined)
const createMatrix = (rows: number, cols: number) =>
  RandomMatrix.evaluate({
    output: {dtoType: DTOType.matrix, rows: rows, columns: cols},
    seed: generateMulberrySeed()
  }, undefined)

// const a = createVector(10000)
// const b = createVector(10000)
const users = 100
const matrix = createMatrix(users, 9000)
const similarity = createMatrix(users, users)

// measure(10, (() => mathZeros(10000)))
// measure(10, () => empty(10000))

measure(1, () => PearsonSimilarityFunction.evaluate({type: "any"}, [matrix]))

// measure(1, () => {
//   NNRecommendFunction.evaluate({type: "any", N: 10} as NNConfig, [similarity, matrix])
// })
