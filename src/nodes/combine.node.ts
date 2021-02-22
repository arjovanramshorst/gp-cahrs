import { NodeConfig } from "./node.ts";
import {
  NodeProcessor,
  ProcessParams,
} from "../interface/processor.interface.ts";
import { ProblemInstance } from "../interface/problem.interface.ts";
import { SimilarityScores } from "../interface/dto.interface.ts";
import { Generateable, WithGenerated } from "./node.interface.ts";
import { pick } from "../utils/random.utils.ts";
import { CombinedMatrix } from "../utils/matrix.utils.ts";

interface Generate {
  strategy: "avg" | "max" | "min";
}

interface ConfigInterface extends Generateable<Generate> {
  type: "Similarity"; // | "CFMatrix"
  entityType: string;
}

export class CombineNodeConfig extends NodeConfig<CombineNodeProcessor> {
  configType = "combine-node";

  constructor(
    protected readonly config: ConfigInterface,
  ) {
    super();
    if (!this.config.generated) {
      this.config.generated = {
        strategy: pick("avg", "max", "min"),
      };
    }
  }

  protected generateInput() {
    return [];
  }

  public setCombineInput(input: NodeConfig<any>[]) {
    this.input = input;
  }

  protected processorFactory() {
    return new CombineNodeProcessor(
      this.config as WithGenerated<ConfigInterface>,
    );
  }
}

export class CombineNodeProcessor
  extends NodeProcessor<WithGenerated<ConfigInterface>> {
  getCombineFunc = (): (arr: number[]) => number => {
    switch (this.config.generated.strategy) {
      case "avg":
        return (arr: number[]) =>
          arr.reduce((agg, curr) => agg + curr, 0) / arr.length;
      case "max":
        return (arr: number[]) => Math.max(...arr);
      case "min":
        return (arr: number[]) => Math.min(...arr);
    }
  };

  prepare(instance: ProblemInstance): void {
  }

  process(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
    // TODO: check inputs from/to are the same
    const func = this.getCombineFunc();

    return {
      fromEntityType: input[0].fromEntityType,
      toEntityType: input[0].toEntityType,
      matrix: new CombinedMatrix(
        input.map((it) => it.matrix),
        this.getCombineFunc(),
        0,
      ),
    };
  }
}
