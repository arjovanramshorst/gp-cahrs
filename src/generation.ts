import {Recommender} from "./recommender.ts";
import {ProblemInstance} from "./interface/problem.interface.ts";
import {ConfigInterface, printConfig} from "./interface/config.interface.ts";
import {Evaluator} from "./evaluate/evaluator.ts";
import {RootNodeConfig} from "./nodes/root.node.ts";
import {NodeConfig} from "./nodes/node.ts";
import {CombineNodeConfig} from "./nodes/combine.node.ts";

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
        private readonly gen: number = 0
    ) {
    }

    public nextGeneration(): Generation {
        // TODO: make sure prepare is called for every generated node here?
        const offspring = this.config.makeReproduce().produceOffspring(this.evaluated)

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

                this.activeRs = it
                const performance = evaluator.evaluate(it)

                // console.log(`Score: ${performance}`)
                this.evaluated.push({
                    score: performance,
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

    private static generateRandomRS(problem: ProblemInstance) {
        return new Recommender(problem)
            .init(
                RootNodeConfig
                    .fromDefaultConfig(problem.defaultConfig)
                    .generate(problem, combineInputs)
            )
    }

    public print() {
        console.log("Running software related to thesis by Arjo van Ramshorst")
        printConfig(this.config)
        console.log()
        console.log(`Current state: ${this.state}`)
        console.log("")
        console.log("")
        this.activeRs?.print()
    }
}

const combineInputs = (input: NodeConfig<any>[]) => {
    const config = new CombineNodeConfig({
        type: "Similarity",
        entityType: "any"
    })
    config.setInput(input)
    return config
}
