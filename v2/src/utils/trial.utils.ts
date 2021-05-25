import {ConfigTree, fun} from "../tree";

export type TrialConfig = Record<string, number>

export const FUNCTIONS = (trialConfig: TrialConfig) => ({
  addVector: () => (input) => fun('addVector', {}, input),
  sum: (weight: number) => (input) => fun('sumMatrix', {weight}, input),
  popularity: () => (input) => fun('popularity', {}, input),
  pearson: () => (input) => fun('pearsonSimilarity', {}, input),
  nearestNeighbour: (n: number) => (input) => fun('nearestNeighbour', {N: n}, input),
  invertedNN: (n: number) => (input) => fun('nearestNeighbour(inverted)', {N: n}, input),
  scale: (scale: number) => (input) => fun('scaleMatrix', { scale }, input),
  compareArray: () => (input) => fun('compareArray', {}, input),
  compareString: () => (input) => fun('compareString', {}, input),
  transpose: () => (input) => fun('transpose', {}, input),

  // Terminals:
  interaction: (i: string) => fun(`interaction(${i})`, {}, []),
  property: (entity: string, property: string) => fun(`property(${entity}.${property})`, {}, []),
  fillMatrix: (from: string, to: string, val: number) => fun('randomMatrix', {seed: val, output: { from, to, rows: trialConfig[from], columns: trialConfig[to]}})
})