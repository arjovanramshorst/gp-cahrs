import { pick } from "./../utils/random.utils.ts";
import { Reproduce } from "./reproduce.ts";
import { combineInputs, EvaluatedRecommender } from "../generation.ts";
import { Recommender } from "../recommender.ts";
import { sumBy } from "../utils/functional.utils.ts";
import { NodeConfig } from "../nodes/node.ts";
import { NodeFactory } from "../nodes/node.interface.ts";
import { RootNodeConfig } from "../nodes/root.node.ts";

const MUTATION_CHANCE = 0.007; // 0.7%

export class RandomReproduce extends Reproduce {
  produceOffspring(generation: EvaluatedRecommender[]): Recommender[] {
    const offspring = [];
    while (offspring.length < generation.length) {

      const [parent1, parent2] = this.tournamentSelection(generation)
      const children = this.crossover(parent1, parent2)
        .map(child => new Recommender(this.problemInstance)
          .init(child.getConfig().mutate(this.problemInstance, combineInputs, MUTATION_CHANCE) as RootNodeConfig)
        )

      offspring.push(...children);
    }

    return offspring;
  }

  tournamentSelection(parents: EvaluatedRecommender[], k = 4) { // add K to config
    const selected = pick<EvaluatedRecommender>(4)(...parents).sort((a, b) => b.score - a.score);

    return [selected[0].recommender, selected[1].recommender]
  }

  crossover(parent1: Recommender, parent2: Recommender) {
    const child1 = parent1.clone()
    const child2 = parent2.clone()
    child1.crossover(child2)

    return [child1, child2]
  }
}
