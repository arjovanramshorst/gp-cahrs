import {ProblemInstance, ProblemInstanceLight} from "../interface/problem.interface.ts";
import {
  NodeProcessor,
  ProcessNodeDTO,
  ProcessParams,
} from "../interface/processor.interface.ts";
import { ProcessTreeNotInitializedError } from "../errors.ts";
import { powerset } from "../utils/functional.utils.ts";
import { getRenderer } from "../renderer.ts";
import { blue, gray, green } from "../deps.ts";
import {NodeOutput, JsonConfig, InternalNodeConfig} from "./node.interface.ts";

export abstract class NodeConfig<C extends NodeProcessor<any>> {
  protected abstract readonly configType: string;

  protected abstract readonly config: InternalNodeConfig;

  protected input: NodeConfig<any>[] = [];

  protected processor?: NodeProcessor<any>;

  private state: string = STATE.PENDING;

  protected abstract generateInput(
    problemInstance: ProblemInstanceLight,
  ): NodeConfig<any>[];

  /**
     *
     * Generates a random valid input configuration.
     *
     * @param problemInstance
     * @param combine is necessary to remove circular dependencies
     */
  public generate(
    problemInstance: ProblemInstanceLight,
    combine: (input: NodeConfig<any>[]) => NodeConfig<any>,
  ) {
    const input = NodeConfig.selectRandom(this.generateInput(problemInstance));
    input.forEach((it) => it.generate(problemInstance, combine));

    if (input.length > 1) {
      this.input = [combine(input)];
    } else {
      this.input = input;
    }

    return this;
  }

  /**
     * Handles mutation for this configuration
     */
  public mutate(
    problemInstance: ProblemInstanceLight,
    combine: (input: NodeConfig<any>[]) => NodeConfig<any>,
    mutationChance: number,
  ) {
    if (
      this.generateInput(problemInstance).length > 0 &&
      Math.random() < mutationChance
    ) {
      this.generate(problemInstance, combine);
    } else {
      this.input.forEach((it) =>
        it.mutate(problemInstance, combine, mutationChance)
      );
    }

    return this;
  }

  public getOutput() {
    return this.config.output
  };

  /**
   * Returns true if this node can be replaced by the target node.
   */
  public canReplace(
    config: NodeConfig<any>,
  ) {
    const output = this.getOutput()
    const compare = config.getOutput()
    return output.fromType === compare.fromType && output.toType === compare.toType
   }

   public getPotentialReplacements(
       other: NodeConfig<any>,
       factory: (type: string, config: InternalNodeConfig) => NodeConfig<any>,
   ): (() => void)[] {
    const potentials = []
      for( let i = 0; i < this.input.length; i++) {
        for (let j = 0; j < other.input.length; j++) {
          if (this.input[i].canReplace(other.input[j])) {

            potentials.push(() => {
              const thisCopy = NodeConfig.parse(this.input[i].stringify(), factory)
              const otherCopy = NodeConfig.parse(other.input[j].stringify(), factory)
              this.input[i] = otherCopy
              other.input[j] = thisCopy
            })
          }
        }
      }

      return potentials
   }

   /**
     * Recursively prepares the input nodes, and finally the current one.
     *
     * @param problemInstance
     */
  public prepare(problemInstance: ProblemInstance) {
    this.processor = this.processorFactory();
    this.input.forEach((it) => it.prepare(problemInstance));

    this.setState(STATE.WORKING);
    this.processor.prepare(problemInstance);
    this.setState(STATE.READY);
    return this;
  }

  /**
     * Recursively processes the input, and finally returns the value as processed by this processor
     *
     * @param params
     */
  public process(params: ProcessParams): ProcessNodeDTO {
    if (!this.processor) {
      throw new ProcessTreeNotInitializedError();
    }
    const input = this.input.map((it) => it.process(params));

    return this.processor.process(input, params);
  }

  protected asArray(): NodeConfig<any>[] {
    const recursiveInput = this.input
        .map(it => it.asArray())
        .flat()

    return [...this.input, ...recursiveInput]
  }

  public print(indent: number = 0): void {
    const stateString = `${this.state}   `;
    console.log(
      `${stateString}${
        [...Array(indent)].map((_) => "| ").join("")
      }${this.configType}`,
    );
    this.input.forEach((it) => it.print(indent + 1));
  }

  public static parse(
    config: JsonConfig,
    factory: (type: string, config: InternalNodeConfig) => NodeConfig<any>,
  ): NodeConfig<any> {
    const node = factory(config.type, config.config);
    const input = config.input.map((input) => NodeConfig.parse(input, factory));
    node.setInput(input);
    return node;
  }

  public stringify(): JsonConfig {
    return {
      type: this.constructor.name,
      config: this.config,
      input: this.input.map((it) => it.stringify()),
    };
  }

  protected abstract processorFactory(): NodeProcessor<any>;

  private setState(state: string) {
    this.state = state;
    getRenderer().updated();
  }

  private setInput(input: NodeConfig<any>[]) {
    this.input = input;
  }

  private static selectRandom(input: NodeConfig<any>[]): NodeConfig<any>[] {
    if (input.length <= 1) {
      return input;
    }

    const ps = powerset(input);

    return ps[Math.floor(Math.random() * ps.length)];
  }
}

const STATE = {
  PENDING: gray("[PENDING]"),
  WORKING: blue("[WORKING]"),
  READY: green("[-READY-]"),
};
