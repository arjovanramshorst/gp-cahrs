import {ConfigTree} from "./tree";
import {pick, selectRandom} from "./utils/random.utils";
import {CONFIG} from "./default.config";
import {DTO, findMatchingType} from "./interface/dto.interface";

export interface EvaluatedConfig {
  config: ConfigTree,
  fitness: number
}

export const produceOffspring = (generation: EvaluatedConfig[], mutate: (output: DTO) => ConfigTree): ConfigTree[] => {
  const offspring = [];
  while (offspring.length < generation.length) {

    const [parent1, parent2] = tournamentSelection(generation)
    const children = crossover(parent1, parent2)
      .map(child => mutateConfigTree(child, mutate))

    offspring.push(...children);
  }

  return offspring;
}

const tournamentSelection = (parents: EvaluatedConfig[], k = CONFIG.REPRODUCTION.TOURNAMENT_SIZE) => { // add K to config
  const selected = pick<EvaluatedConfig>(k)(...parents).sort((a, b) => b.fitness - a.fitness);

  return [selected[0].config, selected[1].config]
}

const crossover = (parent1: ConfigTree, parent2: ConfigTree): [ConfigTree, ConfigTree] => {
  // Make list of nodes for parents
  const parent1Nodes = recursiveConfig(parent1)
  const parent2Nodes = recursiveConfig(parent2)

  // Select random node from parent1
  const crossOver1 = selectRandom(parent1Nodes)

  // Filter for matching types
  const availableMatches = parent2Nodes.filter(it => findMatchingType(it.child.output, crossOver1.child.output))

  if (availableMatches.length === 0) {
    // No available match, just return the two parents
    return [parent1, parent2]
  }
  const crossOver2 = selectRandom(availableMatches)

  // Replace node in parent1 with selected node from parent2
  if (crossOver1.parent !== null) {
    crossOver1.parent.input[crossOver1.childIndex] = crossOver2.child
  } else {
    // Replace entire tree if root node is selected
    parent1 = crossOver2.child
  }

  // Replace node in parent2 with selected node from parent1
  if (crossOver2.parent !== null) {
    crossOver2.parent.input[crossOver2.childIndex] = crossOver1.child
  } else {
    // Replace entire tree if root node is selected
    parent2 = crossOver1.child
  }

  return [parent1, parent2]
}

export const mutateConfigTree = (config: ConfigTree, mutate: (output: DTO) => ConfigTree): ConfigTree => {
  const items = recursiveConfig(config)
  const toMutate = selectRandom(items)

  if (toMutate.parent === null) {
    // Replace entire tree
    return mutate(config.output)
  } else {
    // Replace subset of tree
    toMutate.parent.input[toMutate.childIndex] = mutate(toMutate.child.output)
    return config
  }
}

interface RecursiveConfig {
  parent: ConfigTree | null,
  childIndex: number | null,
  child: ConfigTree
}

const recursiveConfig = (config: ConfigTree, list: RecursiveConfig[] = []): RecursiveConfig[] => {
  if (list.length === 0) {
    // Add root node
    list.push({parent: null, childIndex: null, child: config})
  }
  config.input.forEach((it, idx) => {
    list.push({parent: config, childIndex: idx, child: it})
    recursiveConfig(it, list)
  })

  return list
}
