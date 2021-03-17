
const SIZE = 100000;

var matrixInMemory = 0

const fillMatrix = (rows: number, columns: number, fill: number) => {
  console.log("Start FILL")
  const a: number[][] = []
  for (let i = 0; i < rows; i++) {
    a.push([])
    for (let j = 0; j < columns; j++) {
      a[i].push(fill)
    }
  }
  matrixInMemory++

  console.log("Finish FILL")
  return a
}

const multiplyMatrix = (a: number[][], b: number[][]) => {
  console.log("Start MULTIPLY")
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[i].length; j++) {
      a[i][j] *= b[i][j]
    }
  }
  console.log("Finish MULTIPLY")
  // force GC?
  b = []
  matrixInMemory--
  return a
}

const sumMatrix = (a: number[][], b: number[][]) => {
  console.log("Start SUM")
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      a[i][j] += b[i][j]
    }
  }
  // force GC?
  b = []
  matrixInMemory--
  console.log("Finish SUM")
  return a
}

// const calcRecursiveOld = (config: Config): number[][] => {
//   switch (config.type) {
//     case "sum":
//       return config.input ? sumMatrix(calcRecursiveOld(config.input[0]), calcRecursiveOld(config.input[1])) : []
//     case "multiply":
//       return config.input ? multiplyMatrix(calcRecursiveOld(config.input[0]), calcRecursiveOld(config.input[1])) : []
//     case "fill":
//       return fillMatrix(SIZE, SIZE, config.value ?? 0)
//   }
// }

export const calcRecursive = (config: Config): number[][] => {
  // First do functions
  console.log(`In memory: ${matrixInMemory}`)

  if ( isFunction(config)) {
    return calcFunction(config as ConfigFunction)
  } else {
    return calcTerminal(config as ConfigTerminal)
  }
}

const calcFunction = (config: ConfigFunction): number[][] => {
  let left: number[][]
  let right: number[][]
  if (isFunction(config.input[0])) {
    left = calcRecursive(config.input[0])
    right = calcRecursive(config.input[1])
  } else {
    right = calcRecursive(config.input[1])
    left = calcRecursive(config.input[0])
  }
  switch (config.type) {
    case "sum":
      return config.input ? sumMatrix(left, right) : []
    case "multiply":
      return config.input ? multiplyMatrix(left, right) : []
  }

  throw Error("Can not happen")
}

const calcTerminal = (config: ConfigTerminal): number[][] => {
  switch (config.type) {
    case "fill":
      return fillMatrix(SIZE, SIZE, config.value ?? 0)
  }

  throw Error("CAN NOT HAPPEN")
}

type Config = ConfigFunction | ConfigTerminal

interface ConfigFunction {
  type: "sum" | "multiply"
  input: [Config, Config]
}

interface ConfigTerminal {
  type: "sum" | "fill" | "multiply"
  value: number
}

const terminals = ["fill"]

const isFunction = (config: Config) => terminals.indexOf(config.type) === -1

export const config: Config = {
  type: "sum",
  input: [
    {
      type: "sum",
      input: [{
        type: "fill",
        value: 9
      }, {
        type: "sum",
        input: [{
          type: "fill",
          value: 3
        }, {
          type: "multiply",
          input: [{
            type: "fill",
            value: 4
          }, {
            type: "sum",
            input: [{
              type: "fill",
              value: 9
            }, {
              type: "fill",
              value: 5
            }]
          }]
        }]
      }]
    },
    {
      type: "sum",
      input: [{
        type: "sum",
        input: [
          {
            type: "sum",
            input: [{
              type: "fill",
              value: 9
            }, {
              type: "sum",
              input: [{
                type: "fill",
                value: 3
              }, {
                type: "multiply",
                input: [{
                  type: "fill",
                  value: 4
                }, {
                  type: "sum",
                  input: [{
                    type: "fill",
                    value: 9
                  }, {
                    type: "fill",
                    value: 5
                  }]
                }]
              }]
            }]
          }, {
            type: "multiply",
            input: [{
              type: "fill",
              value: 4
            }, {
              type: "sum",
              input: [{
                type: "fill",
                value: 9
              }, {
                type: "fill",
                value: 5
              }]
            }]
          }]
      }, {
        type: "fill",
        value: 3
      }]
    }]
}

const measure = (times: number, fn: () => void) => {
  const t = performance.now();

  for (let i = 0; i < times; i++) {
    fn();
  }
  const tFinished = performance.now();
  console.log(`Time ran is ${tFinished - t}`);
};

// measure(1, () => calcRecursive(config));

// measure(1, () => testArraySum());

