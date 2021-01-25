import {Recommender} from "./recommender.ts";
import {ProblemInstance} from "./interface/problem.interface.ts";
import {ConfigInterface, printConfig} from "./interface/config.interface.ts";
import {Evaluator, Result} from "./evaluate/evaluator.ts";
import {RootNodeConfig} from "./nodes/root.node.ts";
import {NodeConfig} from "./nodes/node.ts";
import {CombineNodeConfig} from "./nodes/combine.node.ts";
import {getRenderer} from "./renderer.ts";

export interface EvaluatedRecommender {
    score: number
    recommender: Recommender
}

export class Generation {

    private evaluated: EvaluatedRecommender[] = []
    private state: string = ""
    private activeRs: Recommender | null = null

    private constructor(
        private readonly config: ConfigInterface,
        private readonly recommenders: Recommender[],
        private readonly gen: number = 0,
    ) {
    }

    public nextGeneration(instance: ProblemInstance): Generation {
        // TODO: make sure prepare is called for every generated node here?
        const offspring = this.config.makeReproduce(instance).produceOffspring(this.evaluated)

        return new Generation(this.config, offspring, this.gen + 1)
    }

    public prepare() {
        this.recommenders.forEach((it, idx) => {
            this.state = `Preparing Generation ${this.gen} - ${idx + 1} out of ${this.recommenders.length}`
            this.activeRs = it
            it.prepare()
        })

        return this
    }

    public evaluate(evaluator: Evaluator) {
        this.recommenders
            .forEach((it, idx) => {
                this.state = `Evaluating Generation ${this.gen} - ${idx + 1} out of ${this.recommenders.length}`
                getRenderer().updated("Evaluating..")

                this.activeRs = it
                const result = evaluator.evaluate(it)
                this.writeResult(it, this.gen, idx + 1, result)

                // console.log(`Score: ${performance}`)
                this.evaluated.push({
                    score: result.performance,
                    recommender: it
                })
            })
        this.evaluated.sort((a, b) => b.score - a.score)

        return this
    }

    public isFinished() {
        // TODO: check performance score or something?
        return this.gen >= this.config.maxGeneration
    }

    public best(): EvaluatedRecommender {
        return this.evaluated[0]
    }

    public static initialGeneration(config: ConfigInterface, problem: ProblemInstance) {
        const rs = [...Array(config.generationSize)]
            .map(index => Generation.generateRandomRS(problem))

        return new Generation(config, rs)
    }

    public static fromConfig(config: ConfigInterface, problem: ProblemInstance, nodeConfig: RootNodeConfig) {
        return new Generation(config, [new Recommender(problem).init(nodeConfig)])
    }

    private static generateRandomRS(problem: ProblemInstance) {
        return new Recommender(problem)
            .init(
                RootNodeConfig
                    .fromDefaultConfig(problem.defaultConfig)
                    .generate(problem, combineInputs)
            )
    }

    private writeResult(recommender: Recommender, gen: number, idx: number, result: Result) {
        const str = `${gen}|${idx}|${result.fScore}|${result.recall}|${result.precision}|${JSON.stringify(recommender.getConfig().stringify())}\n`
        Deno.writeTextFileSync(this.getOutputFilename(), str, {
            append: true,
            create: true
        })
    }

    private getOutputFilename = () =>
        `${this.config.outputFilename}_${this.config.maxGeneration}_${this.config.generationSize}.csv`


    public print() {
        printConfig(this.config)
        console.log()
        console.log(`Current state: ${this.state}`)
        console.log("")
        console.log("")
        this.activeRs?.print()
    }
}

export const combineInputs = (input: NodeConfig<any>[]) => {
    const config = new CombineNodeConfig({
        type: "Similarity",
        entityType: "any"
    })
    config.setCombineInput(input)
    return config
}
