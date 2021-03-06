import { NodeConfig } from "./node.ts";
import { ProblemInstance } from "../interface/problem.interface.ts";
import {
  NodeProcessor,
  ProcessNodeDTO,
  ProcessParams,
} from "../interface/processor.interface.ts";
import { Entities } from "../interface/entity.interface.ts";
import {
  Recommendations,
  SimilarityScores,
} from "../interface/dto.interface.ts";
import { NearestNeighbourConfig } from "./nearest-neighbour.node.ts";
import { PopularNodeConfig } from "./popular.node.ts";
import { PropertyNodeConfig } from "./property.node.ts";
import {InternalNodeConfig, NodeOutput} from "./node.interface.ts";
import {pick} from "../utils/random.utils.ts";

interface ConfigInterface extends InternalNodeConfig {
  interactionType: string;
  type: "exist" | "maximize" | "minimize";
  property?: string; // keyof?
}

export class RootNodeConfig extends NodeConfig<RootNodeProcessor> {
  configType = "root-node";

  constructor(
    protected readonly config: ConfigInterface,
  ) {
    super();
  }

  generateInput(problemInstance: ProblemInstance): NodeConfig<any>[] {
    const fromType =
      problemInstance.interactionMap[this.config.interactionType].fromType;
    const toType =
      problemInstance.interactionMap[this.config.interactionType].toType;
    return [
      new NearestNeighbourConfig({
        output: {
          fromType,
          toType,
        },
        interactionType: this.config.interactionType,
        toEntityType: toType,
        fromEntityType: fromType,
        compareValueKey: this.config.property,
        inverted: false,
      }),
      new NearestNeighbourConfig({
        output: {
          fromType,
          toType,
        },
        interactionType: this.config.interactionType,
        toEntityType: toType,
        fromEntityType: fromType,
        compareValueKey: this.config.property,
        inverted: true,
      }),
      new PopularNodeConfig({
        output: {
          fromType,
          toType,
        },
        interactionType: this.config.interactionType,
      }),
      ...PropertyNodeConfig.PotentialConfigs(
        problemInstance.entityMap[fromType],
        problemInstance.entityMap[toType],
      ),
    ];
  }

  public crossover(
    other: RootNodeConfig,
    factory: (type: string, config: InternalNodeConfig) => NodeConfig<any>,
  ) {
    const thisConfigs = this.asArray()
    const otherConfigs = other.asArray()
    const potentialReplacements: (() => void)[] = []

    for (let i = 0; i < thisConfigs.length; i++) {
      for (let j = 0; j < otherConfigs.length; j++) {
        thisConfigs[i].getPotentialReplacements(otherConfigs[j], factory)
            .forEach(replacementFunction => potentialReplacements.push(replacementFunction))
      }
    }

    if (potentialReplacements.length > 0) {
      const actualReplacement = pick<() => void>(1)(...potentialReplacements)[0]
      actualReplacement()
    }
  }

  protected processorFactory(): RootNodeProcessor {
    return new RootNodeProcessor(this.config);
  }

  public static fromDefaultConfig(config: RootNodeConfig) {
    return new RootNodeConfig(config.config);
  }
}

export class RootNodeProcessor extends NodeProcessor<ConfigInterface> {
  private entityMap?: Entities<any>;
  private interactionType?: string;

  prepare(problemInstance: ProblemInstance): any {
    this.interactionType = this.config.interactionType;
    const toRecommendType =
      problemInstance.interactionMap[this.config.interactionType].toType;
    this.entityMap = problemInstance.entityMap[toRecommendType];
  }

  // TODO: Allow list of entities in ProcessParams, to be returned sorted, for evaluation purposes
  process(input: SimilarityScores[], params: ProcessParams): Recommendations {
    if (input.length !== 1) {
      throw Error("Invalid input length");
    }

    const result = Object.entries(input[0].matrix.getRow(params.entityId))
      .sort((a, b) => b[1] - a[1])
      .splice(0, 10)
      .map(([key, val]) => ({
        score: val,
        entity: this.entityMap?.entityMatrix[Number(key)] ?? "unknown",
      }));

    // Handle user-user similarity
    // Handle item-item similarity
    // handle user-item similarity
    // Combine both approaches
    // Return top N list
    return {
      interactionType: this.interactionType ?? "",
      recommendations: result,
    };
  }
}
