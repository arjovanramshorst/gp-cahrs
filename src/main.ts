import { WorkerPool } from "./threadpool.ts";
import { Generation } from "./generation.ts";
import { defaultConfig } from "./default.config.ts";
import { ConfigInterface } from "./interface/config.interface.ts";
import { getRenderer } from "./renderer.ts";

const RUNNERS = 4;

const main = async (config: ConfigInterface = defaultConfig) => {
  if (Deno.args.length > 0) {
    if (Deno.args.includes("headless")) {
      getRenderer().setHeadless(true);
    }
  }

  console.log(`Initializing worker pool with ${RUNNERS} workers`);
  const pool = new WorkerPool(RUNNERS);
  pool.init();

  // Read data
  const problem = config.makeProblem();

  // Preprocess data
  console.log(`Reading ${problem.name}...`);
  const instance = await problem.read(1);
  console.log(`...Done!`);

  // let evaluator = config.makeEvaluator(instance);
  // const reproducer = config.makeReproduce(instance);

  console.log("Generating initial generation...");
  // Generate initial generation
  let generation = Generation
    .initialGeneration(config, instance);

  while (!generation.isFinished()) {
    getRenderer().setActive(generation);

    await generation.evaluate(pool);
    // instance = await problem.read(config.interleavedTrainingSize);
    // evaluator = config.makeEvaluator(instance);
    generation = generation.nextGeneration(instance);
  }

  const best = generation.best();

  console.log(`Score of best found RS: ${best.score}`);

  // console.log(output)
};

await main();
