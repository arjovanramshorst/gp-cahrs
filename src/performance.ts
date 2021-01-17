import {ConfigInterface} from "./interface/config.interface.ts";
import {defaultConfig} from "./default.config.ts";
import {RandomNodeConfig} from "./nodes/random.node.ts";
import {getRenderer} from "./renderer.ts";
import {PropertyNodeConfig} from "./nodes/property.node.ts";
import {NodeConfig} from "./nodes/node.ts";
import {CombineNodeConfig} from "./nodes/combine.node.ts";
import {CFNodeConfig} from "./nodes/cf.node.ts";
import {NearestNeighbourConfig} from "./nodes/nearest-neighbour.node.ts";

const main = async (config: ConfigInterface = defaultConfig) => {

    if (Deno.args.length === 0 ) {
        console.log("This command should be called with one or two arguments:")
        console.log("{node} {nRuns?}")
        console.log("example: ./run.sh perf arrayDistance 2")
    }
    const configType = Deno.args[0]
    const runs = Deno.args.length > 1 ? Deno.args[1] : 1

    console.log(`Running test for ${configType}, ${runs} run(s)`)

    // Read data
    const problem = config.makeProblem()

    // Preprocess data
    console.log(`Reading ${problem.name}...`)
    const instance = await problem.read()
    console.log(`...Done!`)

    const testConfig = getConfig(configType)

    getRenderer().setPerformanceTest(testConfig)

    const t = performance.now()
    for (let i = 0; i < runs; i++) {
        testConfig.prepare(instance)
    }
    const tFinished = performance.now()
    console.log(`Time ran is ${tFinished - t}`)
}

await main()


function getConfig(type: string): NodeConfig<any> {
    switch (type) {
        case "random":
            return new RandomNodeConfig({
                fromEntityType: "movie",
                toEntityType: "movie"
            })
        case "arrayDistance":
            return new PropertyNodeConfig({
                comparisonType: "arrayDistance",
                fromEntityType: "movie",
                fromKey: "genres",
                toEntityType: "movie",
                toKey: "genres"
            })
        case "cf":
            return new CFNodeConfig({
                comparisonKey: "rating",
                entityType: "user",
                interactionType: "rating"
            })
        case "nn":
            return new NearestNeighbourConfig({
                compareValueKey: "rating",
                fromEntityType: "user",
                toEntityType: "movie",
                interactionType: "rating",
                inverted: false
            })
        default:
            throw Error()
    }
}