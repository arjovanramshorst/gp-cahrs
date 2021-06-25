import {CONFIG} from "./config";
import {calcRecursive} from "./evaluate";
import {Functions} from "./functions/function";
import {getTerminals} from "./terminals/terminal";
import {ConfigTree, generateTree, generateTreeTables} from "./tree";
import {fitnessScore, FitnessValue, Score} from "./fitness";
import {appendFile, readFSCache, writeFile, writeFSCache} from "./utils/fs.utils";
import {
  EvaluatedConfig,
  getMutateFunction,
  produceOffspring,
} from "./reproduce";
import {printConfig} from "./utils/display.utils";
import {csvHeader, produceCsvLine} from "./utils/output.utils";
import {hash} from "./utils/cache.utils";
import {ProblemInstance} from "./interface/problem.interface";

const filename =
  [
    CONFIG.EXPERIMENT_NAME,
    CONFIG.PROBLEM.name,
    CONFIG.RECOMMEND_INTERACTION,
    CONFIG.REPRODUCTION.EVALUATION,
    `Di${CONFIG.INITIAL_DEPTH}`,
    `Dm${CONFIG.MAX_DEPTH}`,
    `i${CONFIG.INTERLEAVE_SIZE}`,
    `gs${CONFIG.GENERATION_SIZE}`,
    `Pm${CONFIG.REPRODUCTION.MUTATION_RATE}`,
    `Pc${CONFIG.REPRODUCTION.CROSSOVER_RATE}`,
    `Ppr${CONFIG.REPRODUCTION.PARAM_MUTATION_RATE}`,
    `Pps${CONFIG.REPRODUCTION.PARAM_MUTATION_SPEED}`,
    `Pe${CONFIG.REPRODUCTION.ELITISM}`,
    `ts${CONFIG.REPRODUCTION.TOURNAMENT_SIZE}`
  ]
    .filter((it) => !!it)
    .join("_") + ".csv";


const memoize = (problem: ProblemInstance, config: ConfigTree, fn: () => Score) => {
  const key = `results/${hash(problem, config)}`
  const cached = readFSCache(key)
  if (cached) {
    console.log(`Full program cache hit: ${key}`)
    return cached
  }

  const res = fn()
  writeFSCache(key, res)

  return res
}
/*************************************************************************
 *************************************************************************
 *************************************************************************
 * Main loop:
 *
 *************************************************************************
 *************************************************************************
 *************************************************************************
 */
const main = async (readProblem = CONFIG.PROBLEM.read) => {
  // Override existing files, so restarting is not an issue
  writeFile(filename, csvHeader);

  await evaluateBaseline();

  if (CONFIG.ONLY_BASELINE) {
    return
  }
  const readProblemWithInteraction = (size?: number, seed?: number) => readProblem(size, seed, CONFIG.RECOMMEND_INTERACTION)

  const problem = await readProblemWithInteraction(CONFIG.INTERLEAVE_SIZE);

  const functions = Functions;
  const terminals = getTerminals(problem);

  const treeTablesGrowth = generateTreeTables(
    terminals,
    functions,
    CONFIG.INITIAL_DEPTH,
    true
  );
  const treeTablesFull = generateTreeTables(
    terminals,
    functions,
    CONFIG.INITIAL_DEPTH,
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
        CONFIG.INITIAL_DEPTH,
        true
      )
    );
    generation.push(
      generateTree(
        problem.output,
        treeTablesFull,
        terminals,
        functions,
        CONFIG.INITIAL_DEPTH,
        false
      )
    );
  }
  let bestEver: EvaluatedConfig;

  console.log("Generating initial population - DONE");
  for (let gen = 0; gen < CONFIG.GENERATIONS; gen++) {
    console.log(`Sampling dataset for generation #${gen}`);
    const sampledProblem = await readProblemWithInteraction(CONFIG.INTERLEAVE_SIZE);
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
    console.log(`Evaluating generation #${gen} RS ${idx}:`);
    printConfig(config);
    writeFile(`recent/${filename}.json`, JSON.stringify(config));
    let fitness: Score;
    try {
      fitness = memoize(problem, config, () => {
        const res = calcRecursive(config, problem);
        return fitnessScore(res, problem, baselineFitness);
      })
    } catch (e) {
      console.log("Evaluating individual went wrong?:")
      console.log(e)
    }

    if (fitness) {
      const str = produceCsvLine(
        `${gen}`,
        "individual",
        `${idx}`,
        fitness.raw,
        fitness.normalized,
        config
      );

      appendFile(filename, str);

      const score = fitness.raw[CONFIG.REPRODUCTION.EVALUATION]

      console.log(`Evaluating generation #${gen} RS ${idx} - DONE (${score})`);
      return {
        config,
        fitness: score,
      };
    } else {
      return null
    }
  }).filter(it => !!it);
};

const evaluateBaseline = async () => {
  console.log(`Evaluating baseline on verification sample`);
  const problem = await CONFIG.PROBLEM.read(
    CONFIG.INTERLEAVE_SIZE,
    CONFIG.VERIFICATION_SEED,
    CONFIG.RECOMMEND_INTERACTION
);
  try {
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
  } catch (e) {
    console.log(e)
  }
};

const evaluateBestOfGeneration = async (config: ConfigTree): Promise<FitnessValue> => {
  const problem = await CONFIG.PROBLEM.read(
    CONFIG.INTERLEAVE_SIZE,
    CONFIG.VERIFICATION_SEED,
    CONFIG.RECOMMEND_INTERACTION
  );

  return memoize(problem, config, () => {
    return fitnessScore(
      calcRecursive(config, problem),
      problem
    )
  }).raw
};

const validateConfig = (): boolean => {
  if (!['mrr', 'precision1', 'precision5', 'precision10', 'recall', 'fScore'].includes(CONFIG.REPRODUCTION.EVALUATION)) {
    console.error("Invalid value for $CAHRS_EVALUATION: ", CONFIG.REPRODUCTION.EVALUATION)
    return false
  }

  return true
}

if (validateConfig()) {
  main();
}
