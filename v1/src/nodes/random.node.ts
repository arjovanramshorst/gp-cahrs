import { NodeConfig } from "./node.ts";
import {
  NodeProcessor,
  ProcessNodeDTO,
  ProcessParams,
} from "../interface/processor.interface.ts";
import { ProblemInstance } from "../interface/problem.interface.ts";
import { SimilarityScores } from "../interface/dto.interface.ts";
import { getRenderer } from "../renderer.ts";
import { VectorMatrix } from "../utils/matrix.utils.ts";
import { EntityId } from "../interface/entity.interface.ts";
import {Generateable, InternalNodeConfig, WithGenerated} from "./node.interface.ts";

interface Generate {
  seed: number;
}

interface ConfigInterface extends Generateable<Generate>, InternalNodeConfig {
  fromEntityType: string;
  toEntityType: string;
}

export class RandomNodeConfig extends NodeConfig<RandomNodeProcessor> {
  configType = `random-node `;

  constructor(
    protected readonly config: ConfigInterface,
  ) {
    super();
    if (!this.config.generated) {
      this.config.generated = {
        seed: Math.floor(Math.random() * (2 ** 32)),
      };
    }
  }

  protected generateInput() {
    return [];
  }

  protected processorFactory() {
    return new RandomNodeProcessor(
      this.config as WithGenerated<ConfigInterface>,
    );
  }
}

export class RandomNodeProcessor
  extends NodeProcessor<WithGenerated<ConfigInterface>> {
  private scores: Record<EntityId, number> = {};

  mulberry32(a: number) {
    return function () {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  prepare({ entityMap }: ProblemInstance): any {
    getRenderer().updated("Generating random values..");
    const toKeys = Object.keys(
      entityMap[this.config.toEntityType].entityMatrix,
    );

    const random = this.mulberry32(this.config.generated.seed);

    const randomValues = toKeys.reduce((agg, key) => {
      agg[key] = random();
      return agg;
    }, {} as Record<EntityId, number>);

    this.scores = randomValues;
  }

  process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
    return {
      fromEntityType: this.config.fromEntityType,
      toEntityType: this.config.toEntityType,
      matrix: new VectorMatrix(params.entityId, this.scores),
    };
  }
}
