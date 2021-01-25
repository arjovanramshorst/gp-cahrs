import {ConfigInterface} from "./interface/config.interface.ts";
import {defaultConfig} from "./default.config.ts";
import {getRenderer} from "./renderer.ts";
import {NodeConfig} from "./nodes/node.ts";
import {JsonConfig, NodeFactory} from "./nodes/node.interface.ts";
import {Generation} from "./generation.ts";
import {RootNodeConfig} from "./nodes/root.node.ts";

const defaultTest = "array"

const main = async (config: ConfigInterface = defaultConfig) => {

    if (Deno.args.length === 0) {
        console.log("This command should be called with one argument:")
        console.log("{node}")
        console.log("example: ./run.sh perf arrayDistance 2")
    }
    const configType = Deno.args[0] ?? defaultTest

    console.log(`Running evaluation for ${configType}`)

    // Read data
    const problem = config.makeProblem()

    // Preprocess data
    console.log(`Reading ${problem.name}...`)
    const instance = await problem.read()
    console.log(`...Done!`)

    let generation = Generation
        .fromConfig(config, instance, NodeConfig.parse(getConfig(configType), NodeFactory) as RootNodeConfig)

    const evaluator = config.makeEvaluator(instance)

    getRenderer().setActive(generation)

    const t = performance.now()
    generation
        .prepare()
        .evaluate(evaluator)

    const tFinished = performance.now()
    console.log(`Time ran is ${tFinished - t}`)

    const best = generation.best()

    console.log(`Score of best found RS: ${best.score}`)
}

await main()


function getConfig(type: string): JsonConfig {
    switch (type) {
        case "combine":

            return {
                type: "RootNodeConfig",
                config: {
                    interactionType: "rating",
                    type: "maximize",
                    property: "rating"
                },
                input: [
                    {
                        type: "CombineNodeConfig",
                        config: {},
                        input: [
                            {
                                type: "PopularNodeConfig",
                                config: {
                                    interactionType: "rating",
                                    compareValueKey: "rating"
                                },
                                input: []
                            },
                            {
                                type: "RandomNodeConfig",
                                config: {
                                    fromEntityType: "user",
                                    toEntityType: "movie"
                                },
                                input: []

                            }
                        ]
                    }
                ]
            }
        case "popular":
            return {
                type: "RootNodeConfig",
                config: {
                    interactionType: "rating",
                    type: "maximize",
                    property: "rating"
                },
                input: [
                    {
                        type: "PopularNodeConfig",
                        config: {
                            interactionType: "rating",
                            compareValueKey: "rating"
                        },
                        input: []
                    }
                ]
            }
        case "random":
            return {
                type: "RootNodeConfig",
                config: {
                    interactionType: "rating",
                    type: "maximize",
                    property: "rating"
                },
                input: [
                    {
                        type: "RandomNodeConfig",
                        config: {
                            fromEntityType: "user",
                            toEntityType: "movie"
                        },
                        input: []
                    }
                ]
            }
        case "cf":
            return {
                type: "RootNodeConfig",
                config: {
                    interactionType: "rating",
                    type: "maximize",
                    property: "rating"
                },
                input: [
                    {
                        type: "NearestNeighbourConfig",
                        config: {
                            interactionType: "rating",
                            fromEntityType: "user",
                            toEntityType: "movie",
                            compareValueKey: "rating",
                            inverted: false
                        },
                        input: [{
                            type: "CFNodeConfig",
                            config: {
                                entityType: "user",
                                interactionType: "rating",
                                comparisonKey: "rating"
                            },
                            input: []
                        }]
                    }
                ]
            }
        case "array":
            return {
                type: "RootNodeConfig",
                config: {
                    interactionType: "rating",
                    type: "maximize",
                    property: "rating"
                },
                input: [
                    {
                        type: "NearestNeighbourConfig",
                        config: {
                            interactionType: "rating",
                            fromEntityType: "user",
                            toEntityType: "movie",
                            compareValueKey: "rating",
                            inverted: true
                        },
                        input: [{
                            type: "PropertyNodeConfig",
                            config: {
                                comparisonType: "arrayDistance",

                                fromEntityType: "movie",
                                toEntityType: "movie",

                                fromKey: "genres",
                                toKey: "genres",
                            },
                            input: []
                        }]
                    }
                ]
            }
        default:
            throw Error(`Invalid config: ${type}`)
    }
}
