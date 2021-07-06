import { NodeConfig } from "./node.ts";
import {
  NodeProcessor,
  ProcessParams,
} from "../interface/processor.interface.ts";
import { ProblemInstance } from "../interface/problem.interface.ts";
import { SimilarityScores } from "../interface/dto.interface.ts";
import { EntityId } from "../interface/entity.interface.ts";
import { getRenderer } from "../renderer.ts";
import { SparseMatrix } from "../utils/matrix.utils.ts";
import {Generateable, InternalNodeConfig, WithGenerated} from "./node.interface.ts";

interface Generate {
  MIN_SHARED_VALUES: number;
}

interface ConfigInterface extends Generateable<Generate>, InternalNodeConfig {
  entityType: string;
  interactionType: string;
  comparisonKey?: string;
}

const MAX_MIN_SHARED_VALUES = 20;

export class CFNodeConfig extends NodeConfig<CFNodeProcessor> {
  configType = "cf-node";

  constructor(
    protected readonly config: ConfigInterface,
  ) {
    super();
    if (!this.config.generated) {
      this.config.generated = {
        MIN_SHARED_VALUES: Math.floor(Math.random() * MAX_MIN_SHARED_VALUES),
      };
    }
  }

  protected generateInput() {
    return [];
  }

  protected processorFactory() {
    return new CFNodeProcessor(this.config as WithGenerated<ConfigInterface>);
  }
}

export class CFNodeProcessor
  extends NodeProcessor<WithGenerated<ConfigInterface>> {
  private similarities: SparseMatrix<number> = new SparseMatrix();

  prepare(instance: ProblemInstance): any {
    // TODO: Normalize values in matrix here

    getRenderer().updated(
      `Generating similarity matrix: ${this.config.interactionType}.${this
        .config.comparisonKey ?? "<existence>"}`,
    );

    const mapFunction = this.config.comparisonKey
      ? (it: any[]) =>
        it.map((item) => item[this.config.comparisonKey as string])
      : (it: any[]) => it.map((_) => 1);

    let interactionMatrix = instance.interactionMap[this.config.interactionType]
      .interactionMatrix.map(mapFunction);

    const fromRefs = interactionMatrix.getFromRefs();

    // Traditional for loop for performance, figure out if necessary, although pretty readable anyway
    for (let p1 = 0; p1 < fromRefs.length - 1; p1++) {
      getRenderer().setProgress(p1, fromRefs.length);

      const fromRef = fromRefs[p1];
      const fromVector = interactionMatrix.getRow(fromRef);
      for (let p2 = (p1 + 1); p2 < fromRefs.length; p2++) {
        const toRef = fromRefs[p2];
        const toVector = interactionMatrix.getRow(toRef);
        const pearsonSimilarity = this.pearsonCf(fromVector, toVector);
        this.similarities.set(fromRef, toRef, pearsonSimilarity);
        this.similarities.set(toRef, fromRef, pearsonSimilarity);
      }
    }
    getRenderer().updated(
      `Finished generating similarity matrix: ${this.config.interactionType}.${this
        .config.comparisonKey ?? "<existence>"}`,
    );
  }

  process(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
    if (input.length !== 0) {
      throw Error("invalid input length");
    }

    return {
      fromEntityType: this.config.entityType,
      toEntityType: this.config.entityType,
      matrix: this.similarities,
    };
  }

  /**
     * Calculates the Pearson correlation coefficient for two vectors matrix[p1] and matrix[p2].
     * A number close to 1 means the matrices are very similar, a number close to -1 means they
     * are very different.
     * @param v1
     * @param v2
     * @param compareRef
     */
  private pearsonCf(
    v1: Record<EntityId, number>,
    v2: Record<EntityId, number>,
  ) {
    if (!Object.keys(v1) || !Object.keys(v2)) {
      // If either of them has no interactions,return 0
      return 0;
    }

    const arr = Object.keys(v1)
      // Filter only keys both p1 and p2 have
      .filter((toRef) => v2[toRef])
      // Map to object for easier calculation.
      .map((toRef) => ({
        x: v1[toRef],
        y: v2[toRef],
      }));

    const N = arr.length;

    if (
      N === 0 ||
      N <
        Math.min(
          Object.keys(v2).length,
          this.config.generated.MIN_SHARED_VALUES,
        )
    ) {
      // Not enough refs found with matching scores, returning 0
      return 0;
    }

    for (let i = 0; i < v1.length; i++) {
      if (v1[i] && v2[i]) {
        // do something with mean?
      }
    }

    const sumXY = arr.map((a) => a.x * a.y).reduce((sum, v) => sum + v, 0);

    const sumX = arr.reduce((sum, { x }) => x + sum, 0);
    const sumY = arr.reduce((sum, { y }) => y + sum, 0);

    const numerator = sumXY - (sumX * sumY / N);

    const sumSqX = arr.reduce((sum, { x }) => sum + (x * x), 0);
    const sumSqY = arr.reduce((sum, { y }) => sum + (y * y), 0);

    const denominator = Math.sqrt(
      (sumSqX - (sumX * sumX / N)) * (sumSqY - (sumY * sumY) / N),
    );

    if (denominator === 0) {
      return -1;
    }

    const res = numerator / denominator;

    return res;
  }
}
