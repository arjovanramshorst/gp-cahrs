import {Generation} from "./generation.ts";
import {defaultConfig} from "./default.config.ts";
import {ConfigInterface} from "./interface/config.interface.ts";
import {getRenderer} from "./renderer.ts";

const main = async (config: ConfigInterface = defaultConfig) => {

    // Read data
    const problem = config.makeProblem()

    // Preprocess data
    console.log(`Reading ${problem.name}...`)
    let instance = await problem.read(0.1)
    console.log(`...Done!`)

    let evaluator = config.makeEvaluator(instance)

    console.log("Generating initial generation...")
    // Generate initial generation
    let generation = Generation
        .initialGeneration(config, instance)

    while (!generation.isFinished()) {
        getRenderer().setActive(generation)
        generation.evaluate(evaluator)
        instance = await problem.read(config.interleavedTrainingSize)
        evaluator = config.makeEvaluator(instance)
        generation = generation.nextGeneration(instance)
    }

    const best = generation.best()

    console.log(`Score of best found RS: ${best.score}`)

    // console.log(output)
}

await main()