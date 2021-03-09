import { ProcessTreeNotInitializedError } from "./errors.ts";
import { EntityId } from "./interface/entity.interface.ts";
import {ProblemInstance, ProblemInstanceLight} from "./interface/problem.interface.ts";
import { RootNodeConfig } from "./nodes/root.node.ts";
import { Recommendations } from "./interface/dto.interface.ts";
import { NodeConfig } from "./nodes/node.ts";
import { JsonConfig, NodeFactory } from "./nodes/node.interface.ts";

export class Recommender {
  private state = "        ";
  constructor(
    private readonly problemInstance: ProblemInstanceLight,
  ) {
  }

  private config?: RootNodeConfig;

  public init(config: RootNodeConfig) {
    this.state = "INIT    ";

    this.config = config;

    return this;
  }

  public prepare(problemInstance: ProblemInstance) {
    if (!this.config) {
      throw Error("Not yet initialized");
    }
    this.state = "PREPARE ";
    this.config.prepare(problemInstance);

    return this;
  }

  public recommend(entityId: EntityId): Recommendations {
    return this.getConfig().process({
      entityId,
    }) as Recommendations;
  }

  public print() {
    this.getConfig().print();
  }

  public getConfig() {
    if (!this.config) {
      throw new ProcessTreeNotInitializedError();
    }

    return this.config;
  }

  public crossover(other: Recommender) {
    this.getConfig().crossover(other.getConfig(), NodeFactory)
  }

  public clone() {
    const clone = new Recommender(this.problemInstance);
    const copiedConfig = NodeConfig.parse(
      this.getConfig().stringify(),
      NodeFactory,
    ) as RootNodeConfig;
    return clone.init(copiedConfig);
  }

  public hash() {
    return JSON.stringify(this.getConfig().stringify());
  }

  public static fromConfigHash(
    problemInstance: ProblemInstance,
    hash: JsonConfig,
  ) {
    const recommender = new Recommender(problemInstance);
    const config = NodeConfig.parse(
      hash,
      NodeFactory,
    ) as RootNodeConfig;
    return recommender.init(config);
  }
}
