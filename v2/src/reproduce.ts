import {ConfigTree, generateTree} from "./tree";
import {pick, selectRandom} from "./utils/random.utils";
import {CONFIG} from "./config";
import {DTO, findMatchingType} from "./interface/dto.interface";
import {printConfig} from "./utils/display.utils";

export interface EvaluatedConfig {
  config: ConfigTree,
  fitness: number
}

export type MutateFn = (output: DTO, maxDepth: number) => ConfigTree

export const produceOffspring = (generation: EvaluatedConfig[], mutate: MutateFn): ConfigTree[] => {
  const offspring = [];
  while (offspring.length < generation.length) {

    const [parent1, parent2] = tournamentSelection(generation)

    const children = crossover(parent1, parent2)

    console.log("Children:")
    children.forEach(it => { printConfig(it); console.log() })

    const mutatedChildren = children.map(child => mutateConfigTree(child, mutate))

    console.log("Children after mutation:")
    mutatedChildren.forEach(it => { printConfig(it); console.log() })
    offspring.push(...children);
  }

  return offspring;
}

const tournamentSelection = (parents: EvaluatedConfig[], k = CONFIG.REPRODUCTION.TOURNAMENT_SIZE) => { // add K to config
  const tournamentLeft = pick<EvaluatedConfig>(k)(...parents)
  const left = tournamentLeft.sort((a, b) => b.fitness - a.fitness)[0];

  const tournamentRight = pick<EvaluatedConfig>(k)(...parents)
  const right = tournamentRight.sort((a, b) => b.fitness - a.fitness)[0];

  console.log(`Parent left (${left.fitness}):`)
  printConfig(left.config)

  console.log(`Parent right (${right.fitness}):`)
  printConfig(right.config)

  return [left.config, right.config]
}

const crossover = (parent1: ConfigTree, parent2: ConfigTree): ConfigTree[] => {
  // Clone parents
  let child1 = cloneConfig(parent1)
  let child2 = cloneConfig(parent2)

  // Make list of nodes for child
  const child1Nodes = recursiveConfig(child1)
  const child2Nodes = recursiveConfig(child2)

  // Select random node from child1
  const crossOver1 = selectRandom(child1Nodes)
  console.log("Replacing in left:")
  printConfig(crossOver1.child)

  // Filter for matching types
  const availableMatches = child2Nodes.filter(it => findMatchingType(it.child.output, crossOver1.child.output))

  if (availableMatches.length === 0) {
    // No available match, just return the two children
    return [child1, child2]
  }
  const crossOver2 = selectRandom(availableMatches)
  console.log("With from right:")
  printConfig(crossOver2.child)

  // Replace node in parent1 with selected node from parent2
  if (crossOver1.parent !== null) {
    crossOver1.parent.input[crossOver1.childIndex] = cloneConfig(crossOver2.child)
  } else {
    // Replace entire tree if root node is selected
    child1 = cloneConfig(crossOver2.child)
  }

  // Replace node in parent2 with selected node from parent1
  if (crossOver2.parent !== null) {
    crossOver2.parent.input[crossOver2.childIndex] = cloneConfig(crossOver1.child)
  } else {
    // Replace entire tree if root node is selected
    child2 = cloneConfig(crossOver1.child)
  }

  // Remove programs that are too big (can never be both in the case of crossover)
  if (maxDepth(child1) > CONFIG.MAX_DEPTH) {
    child1 = undefined
  } else if (maxDepth(child2) > CONFIG.MAX_DEPTH) {
    child2 = undefined
  }

  return [child1, child2].filter(it => !!it)
}

export const mutateConfigTree = (config: ConfigTree, mutate: MutateFn): ConfigTree => {
  const items = recursiveConfig(config)
  const toMutate = selectRandom(items)

  if (CONFIG.DEBUG_MODE) {
    console.log("Mutating:")
    printConfig(toMutate.child)
  }

  if (toMutate.parent === null) {
    // Replace entire tree
    console.log("Entire tree is randomly generated during mutation")
    return mutate(config.output, CONFIG.MAX_DEPTH)
  } else {
    // Replace subset of tree (make sure that resulting program is not bigger than max-depth
    const mutation = mutate(toMutate.child.output, CONFIG.MAX_DEPTH - toMutate.depth)
    if (mutation) {
      // mutate can be undefined if no valid mutation is found (which is weird)
      console.log(`Mutating at depth: ${toMutate.depth}, with mutation tree: `)
      printConfig(toMutate.child)

      toMutate.parent.input[toMutate.childIndex] = mutation

    } else {
      console.log("Can not find a mutation for: ")
      printConfig(toMutate.child)
    }
    return config
  }
}

export const getMutateFunction = (treeTablesGrowth, terminals, functions) => {
  return (output: DTO, maxDepth: number) => {
    try {
      return generateTree(output, treeTablesGrowth, terminals, functions, maxDepth, true)
    } catch (e) {
      // Return undefined if there is no valid mutation
      return undefined
    }
  }
}

interface RecursiveConfig {
  depth: number,
  parent: ConfigTree | null,
  childIndex: number | null,
  child: ConfigTree
}

const recursiveConfig = (config: ConfigTree, list: RecursiveConfig[] = [], depth = 0): RecursiveConfig[] => {
  if (list.length === 0) {
    // Add root node
    list.push({parent: null, childIndex: null, child: config, depth: depth})
  }
  config.input.forEach((it, idx) => {
    list.push({parent: config, childIndex: idx, child: it, depth: depth + 1})
    recursiveConfig(it, list, depth + 1)
  })

  return list
}

const maxDepth = (config: ConfigTree) => recursiveConfig(config).reduce((max, curr) => curr.depth > max ? curr.depth : max, 0) + 1

// Used to make sure there are no circular references anywhere
const cloneConfig = (config: ConfigTree): ConfigTree => JSON.parse(JSON.stringify(config))