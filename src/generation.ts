import { WorkerPool } from "./threadpool.ts";
import { Recommender } from "./recommender.ts";
import { ProblemInstance } from "./interface/problem.interface.ts";
import { ConfigInterface, printConfig } from "./interface/config.interface.ts";
import { Result } from "./evaluate/evaluator.ts";
import { RootNodeConfig } from "./nodes/root.node.ts";
import { NodeConfig } from "./nodes/node.ts";
import { CombineNodeConfig } from "./nodes/combine.node.ts";

export interface EvaluatedRecommender {
  score: number;
  recommender: Recommender;
}

export class Generation {
  private evaluated: EvaluatedRecommender[] = [];
  private state: string = "";
  private activeRs: Recommender | null = null;

  private constructor(
    private readonly config: ConfigInterface,
    private readonly recommenders: Recommender[],
    readonly gen: number = 0,
  ) {
  }

  public nextGeneration(instance: ProblemInstance): Generation {
    const offspring = this.config.makeReproduce(instance).produceOffspring(
      this.evaluated,
    );

    return new Generation(this.config, offspring, this.gen + 1);
  }

  public async evaluate(
    workerPool: WorkerPool,
    interleaveSize: number,
    interleaveSeed: number,
  ) {
    const results = await Promise.all(
      this.recommenders
        .map((it) => it.getConfig().stringify())
        .map((config, idx) =>
          workerPool.addWorkerTask({
            generation: this.gen,
            idx: idx,
            recommenderHash: config,
            interleaveSize,
            interleaveSeed,
          })
        ),
    );

    results.forEach((res) => {
      this.writeResult(
        this.recommenders[res.idx],
        this.gen,
        res.idx,
        res.result,
      );
      this.evaluated.push({
        score: res.result.performance,
        recommender: this.recommenders[res.idx],
      });
    });

    this.evaluated.sort((a, b) => b.score - a.score);

    return this;
  }

  public isFinished() {
    // TODO: check performance score or something?
    return this.gen >= this.config.maxGeneration;
  }

  public best(): EvaluatedRecommender {
    return this.evaluated[0];
  }

  public static initialGeneration(
    config: ConfigInterface,
    problem: ProblemInstance,
  ) {
    const rs = [...Array(config.generationSize)]
      .map((index) => Generation.generateRandomRS(problem));

    return new Generation(config, rs);
  }

  public static fromConfig(
    config: ConfigInterface,
    problem: ProblemInstance,
    nodeConfig: RootNodeConfig,
  ) {
    return new Generation(config, [new Recommender(problem).init(nodeConfig)]);
  }

  private printMostRecent() {
    if (this.activeRs != null) {
      Deno.writeTextFileSync(
        "../output/most_recent_config.json",
        JSON.stringify(this.activeRs.getConfig().stringify(), null, 2),
        {
          append: false,
          create: true,
        },
      );
    }
  }

  private static generateRandomRS(problem: ProblemInstance) {
    return new Recommender(problem)
      .init(
        RootNodeConfig
          .fromDefaultConfig(problem.defaultConfig)
          .generate(problem, combineInputs),
      );
  }

  private writeResult(
    recommender: Recommender,
    gen: number,
    idx: number,
    result: Result,
    validate: boolean = false,
  ) {
    const str =
      `${gen}|${idx}|${result.fScore}|${result.recall}|${result.precision}|${
        JSON.stringify(recommender.getConfig().stringify())
      }\n`;
    Deno.writeTextFileSync(this.getOutputFilename(validate), str, {
      append: true,
      create: true,
    });
  }

  private getOutputFilename = (validate: boolean) =>
    `../output/${this.config.outputFilename}_${this.config.maxGeneration}_${this.config.generationSize}${
      validate ? "_validate" : ""
    }.csv`;

  public print() {
    printConfig(this.config);
    console.log();
    console.log(`Current state: ${this.state}`);
    console.log("");
    console.log("");
    this.activeRs?.print();
  }
}

export const combineInputs = (input: NodeConfig<any>[]) => {
  const config = new CombineNodeConfig({
    type: "Similarity",
    entityType: "any",
  });
  config.setCombineInput(input);
  return config;
};
