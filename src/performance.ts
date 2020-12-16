import {ConfigInterface} from "./interface/config.interface.ts";
import {defaultConfig} from "./default.config.ts";
import {RandomNodeConfig} from "./nodes/random.node.ts";
import {getRenderer} from "./renderer.ts";
import {PropertyNodeConfig} from "./nodes/property.node.ts";
import {NodeConfig} from "./nodes/node.ts";

const users = 610
const movies = 9742
const items = users * movies

const main = async (config: ConfigInterface = defaultConfig) => {

    // Read data
    const problem = config.makeProblem()

    // Preprocess data
    console.log(`Reading ${problem.name}...`)
    const instance = await problem.read()
    console.log(`...Done!`)

    const testConfig = getConfig("arrayDistance")

    getRenderer().setPerformanceTest(testConfig)

    const t = performance.now()
    for (let i = 0; i < 1; i++) {
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
        default:
            throw Error()
    }
}