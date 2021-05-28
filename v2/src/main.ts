import { CONFIG } from "./config";
import { calcRecursive } from "./evaluate";
import { Functions } from "./functions/function";
import { getTerminals } from "./terminals/terminal";
import { ConfigTree, generateTree, generateTreeTables } from "./tree";
import { fitnessScore, FitnessValue, Score } from "./fitness";
import { appendFile, writeFile } from "./utils/fs.utils";
import {
  EvaluatedConfig,
  getMutateFunction,
  produceOffspring,
} from "./reproduce";
import { printConfig } from "./utils/display.utils";
import { csvHeader, produceCsvLine } from "./utils/output.utils";

const filename =
  [
    new Date().toISOString().substring(0, 10),
    CONFIG.EXPERIMENT_NAME,
    CONFIG.PROBLEM.name,
    `d${CONFIG.MAX_DEPTH}`,
    `i${CONFIG.INTERLEAVE_SIZE}`,
    `gs${CONFIG.GENERATION_SIZE}`,
    `m${CONFIG.REPRODUCTION.MUTATION_RATE}`,
    `c${CONFIG.REPRODUCTION.CROSSOVER_RATE}`,
    `ts${CONFIG.REPRODUCTION.TOURNAMENT_SIZE}`
  ]
    .filter((it) => !!it)
    .join("_") + ".csv";

/*************************************************************************
 *************************************************************************
 *************************************************************************
 * Main loop:
 *
 * TODO: Add CF based baseline evaluation to sobazaar
 *************************************************************************
 *************************************************************************
 *************************************************************************
 */
const main = async (readProblem = CONFIG.PROBLEM.read) => {
  appendFile(filename, csvHeader);

  await evaluateBaseline();

  if (CONFIG.ONLY_BASELINE) {
    return
  }

  const problem = await readProblem(CONFIG.INTERLEAVE_SIZE);

  const functions = Functions;
  const terminals = getTerminals(problem);

  const treeTablesGrowth = generateTreeTables(
    terminals,
    functions,
    CONFIG.MAX_DEPTH,
    true
  );
  const treeTablesFull = generateTreeTables(
    terminals,
    functions,
    CONFIG.MAX_DEPTH,
    false
  );

  console.log("Generating initial population");
  let generation = [];
  for (let i = 0; i < CONFIG.GENERATION_SIZE / 2; i++) {
    generation.push(
      generateTree(
        problem.output,
        treeTablesGrowth,
        terminals,
        functions,
        CONFIG.MAX_DEPTH,
        true
      )
    );
    generation.push(
      generateTree(
        problem.output,
        treeTablesFull,
        terminals,
        functions,
        CONFIG.MAX_DEPTH,
        false
      )
    );
  }
  let bestEver: EvaluatedConfig;

  console.log("Generating initial population - DONE");
  for (let gen = 0; gen < CONFIG.GENERATIONS; gen++) {
    console.log(`Sampling dataset for generation #${gen}`);
    const sampledProblem = await readProblem(CONFIG.INTERLEAVE_SIZE);
    console.log(`Sampling dataset for generation #${gen} - DONE`);

    const treeTablesGrowth = generateTreeTables(
      terminals,
      functions,
      CONFIG.MAX_DEPTH,
      true
    );

    const mutateFn = getMutateFunction(treeTablesGrowth, terminals, functions);

    console.log(`Evaluating generation #${gen}`);
    const evaluated = evaluateGeneration(gen, generation, sampledProblem);
    console.log(`Evaluating generation #${gen} - DONE`);
    const bestForGeneration = evaluated.sort(
      (a, b) => b.fitness - a.fitness
    )[0];
    console.log(`Best for generation: (${bestForGeneration.fitness})`);
    printConfig(bestForGeneration.config);

    console.log(`Evaluating on verification sample`);
    const bestForGenerationFitness = await evaluateBestOfGeneration(
      bestForGeneration.config
    );
    const str = produceCsvLine(
      `${gen}`,
      "best",
      "-",
      bestForGenerationFitness,
      bestForGenerationFitness,
      bestForGeneration.config
    );
    appendFile(filename, str);
    console.log(
      `Evaluating on verification sample - DONE (${bestForGenerationFitness.performance})`
    );

    if (!bestEver || bestEver.fitness < bestForGenerationFitness.performance) {
      console.log("Improvement found!");
      bestEver = {
        config: bestForGeneration.config,
        fitness: bestForGenerationFitness.performance,
      };
    }

    console.log(`Producing generation #${gen + 1}`);
    generation = produceOffspring(evaluated, mutateFn);
    console.log(`Producing generation #${gen + 1} - DONE`);
  }

  console.log(`Finished, best RS found: (${bestEver.fitness})`);
  printConfig(bestEver.config);
};

const evaluateGeneration = (
  gen: number,
  configs: ConfigTree[],
  problem
): EvaluatedConfig[] => {
  const cache = {};
  console.log(`Evaluating generation #${gen} Baseline`);
  const baselineFitness = fitnessScore(
    calcRecursive(problem.baseline, problem),
    problem
  ).raw;
  console.log(
    `Evaluating generation #${gen} Baseline - DONE (${baselineFitness.performance})`
  );

  const str = produceCsvLine(
    `${gen}`,
    "gen_baseline",
    "-",
    baselineFitness,
    {
      fScore: 0,
      precision: 0,
      recall: 0,
      performance: 0,
      precision10: 0,
      precision5: 0,
      precision1: 0,
      mrr: 0
    },
    problem.baseline
  );
  appendFile(filename, str);

  return configs.map((config, idx) => {
    const key = JSON.stringify(config);
    console.log(`Evaluating generation #${gen} RS ${idx}:`);
    printConfig(config);
    writeFile("most_recent.json", JSON.stringify(config));
    let fitness: Score;
    if (cache[key]) {
      console.log("Using cache..");
      fitness = cache[key];
    } else {
      const res = calcRecursive(config, problem);
      fitness = fitnessScore(res, problem, baselineFitness);
      cache[JSON.stringify(config)] = fitness;
    }

    const str = produceCsvLine(
      `${gen}`,
      "individual",
      `${idx}`,
      fitness.raw,
      fitness.normalized,
      config
    );

    appendFile(filename, str);

    const score = CONFIG.NORMALIZE
      ? fitness.normalized.performance
      : fitness.raw.performance;
    console.log(`Evaluating generation #${gen} RS ${idx} - DONE (${score})`);
    return {
      config,
      fitness: score,
    };
  });
};

const evaluateBaseline = async () => {
  console.log(`Evaluating baseline on verification sample`);
  const problem = await CONFIG.PROBLEM.read(
    CONFIG.INTERLEAVE_SIZE,
    CONFIG.VERIFICATION_SEED
  );
  const baselineFitness = fitnessScore(
    calcRecursive(problem.baseline, problem),
    problem
  ).raw;
  const str = produceCsvLine(
    `-`,
    "baseline",
    "-",
    baselineFitness,
    baselineFitness,
    problem.baseline
  );
  appendFile(filename, str);
  console.log(
    `Evaluating on verification sample - DONE (${baselineFitness.performance})`
  );
};

const bestOfCache: Record<string, FitnessValue> = {};
const evaluateBestOfGeneration = async (config: ConfigTree) => {
  const key = JSON.stringify(config);
  if (bestOfCache[key]) {
    return bestOfCache[key];
  }
  // TODO: Make sure that config does not care about size, so validation can be done on different sizes
  const problem = await CONFIG.PROBLEM.read(
    CONFIG.INTERLEAVE_SIZE,
    CONFIG.VERIFICATION_SEED
  );

  const validationFitness = fitnessScore(
    calcRecursive(config, problem),
    problem
  ).raw;
  bestOfCache[key] = validationFitness;

  return validationFitness;
};

main();
