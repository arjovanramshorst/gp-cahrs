import { generateMulberrySeed } from "./utils/random.utils.ts";
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

  // Preprocess data, used for generating the initial generation of RS's.
  console.log(`Reading ${problem.name}...`);
  const instance = await problem.readLight();
  console.log(`...Done!`);

  // Generate initial generation
  console.log("Generating initial generation...");
  let generation = Generation
    .initialGeneration(config, instance);

  while (!generation.isFinished()) {
    getRenderer().setActive(generation);

    switch (config.overfitting) {
      case "interleaved":
        await generation.evaluate(
          pool,
          // Take random 10% of test set every other generation
          generation.gen % 2 === 0 ? 1 : 0.1,
          generateMulberrySeed(),
        );
        break;
      case "normal":
        await generation.evaluate(
          pool,
          1,
          generateMulberrySeed(),
        );
        break;
      default:
        throw Error(
          `Invalid config value for overfitting: ${config.overfitting}`,
        );
    }

    generation = generation.nextGeneration(instance);
  }
};

await main();
