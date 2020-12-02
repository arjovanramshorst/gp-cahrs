import {Generation} from "./generation.ts";
import {defaultConfig} from "./default.config.ts";
import {ConfigInterface} from "./interface/config.interface.ts";

const main = async (config: ConfigInterface = defaultConfig) => {

    // Read data
    const problem = config.makeProblem()

    // Preprocess data
    console.log(`Reading ${problem.name}...`)
    const instance = await problem.read()
    console.log(`...Done!`)

    const evaluator = config.makeEvaluator(instance)

    console.log("Generating initial generation...")
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

    // console.log(output)
}

await main()