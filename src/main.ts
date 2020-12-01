import {Generation} from "./generation.ts";
import {defaultConfig} from "./default.config.ts";
import {ConfigInterface} from "./interface/config.interface.ts";

const main = async (config: ConfigInterface = defaultConfig) => {

    // Read data
    const problem = config.makeProblem()

    // Preprocess data
    const instance = await problem.read()

    const evaluator = config.makeEvaluator(instance)

    // Generate initial generation
    let generation = Generation
        .initialGeneration(config, instance)
        .evaluate(evaluator)

    while (!generation.isFinished()) {
        generation = generation
            .nextGeneration()
            .evaluate(evaluator)
    }

    const best = generation.best()

    console.log(`Score of best found RS: ${best.score}`)

    const output = best.recommender.recommend(1)

    // console.log(output)
}

await main()