import { WorkerPool } from "./threadpool.ts";
import { JsonConfig } from "./nodes/node.interface.ts";
import { defaultConfig } from "./default.config.ts";
import { WorkerRequest, WorkerResponse } from "./worker.ts";
// For each individual in a generation
// as long as a configuration exists
// every time a new worker is available

const RUNNERS = 4;

const config = {
  type: "RootNodeConfig",
  config: {
    interactionType: "rating",
    type: "maximize",
    property: "rating",
  },
  input: [
    {
      type: "PopularNodeConfig",
      config: {
        interactionType: "rating",
        compareValueKey: "rating",
      },
      input: [],
    },
  ],
};

const runConfigs = async (configs: JsonConfig[]) => {
  const pool = new WorkerPool(RUNNERS);
  pool.init();
  const results = configs.map((it, idx) => ({
    idx: idx,
    generation: 0,
    recommenderHash: it,
  })).map((it) => pool.addWorkerTask(it));

  return await Promise.all(results);
};


const main = () => {
  // Generate initial generation
  
  let generation = Generation.initialGeneration(config, instance);

    while ()
  // Evaluate
  // Add evaluated
}