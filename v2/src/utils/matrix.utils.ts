// @ts-ignore
import {size, row, subset, index} from "mathjs";

export const matrixSize = (matrix: any) => {
  const res = []
  size(matrix).forEach(it => res.push(it))
  return res
}

export const vectorSize = (vector: any) => {
  const res = matrixSize(vector)

  return res[1]
}

export const matrixRow = (matrix: any, row: number) => {
// @ts-ignore
  return row(matrix, row)
}

export const vectorGet = (vector: any, col: number) => {
  return subset(vector, index(0, col))
}

export const matrixGet = (matrix: any, row: number, col: number) => {
  return subset(matrix, index(row, col))
}

export const matrixSet = (matrix: any, row: number, col: number, value: number) => {
  return subset(matrix, index(row, col), value)
}