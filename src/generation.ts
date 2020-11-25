import {Recommender} from "./recommender.ts";
import {ProblemInstance} from "./interface/problem.interface.ts";
import {ConfigInterface} from "./interface/config.interface.ts";
import {Evaluate} from "./evaluate/evaluate.ts";

export interface EvaluatedRecommender {
    score: number
    recommender: Recommender
}

export class Generation {

    private evaluated: EvaluatedRecommender[] = []

    private constructor(
        private readonly config: ConfigInterface,
        private readonly recommenders: Recommender[],
        private readonly gen: number = 0
    ) { }

    public nextGeneration(): Generation {
        // TODO: Implement crossover/mutation
        const offspring = this.config.reproduce().produceOffspring(this.evaluated)

        return new Generation(this.config, offspring, this.gen + 1)
    }

    public evaluate(evaluator: Evaluate) {
        console.log(`Evaluating Generation #${this.gen}...`)
        this.recommenders
            .forEach((it, idx)=> {
                console.log(`Evaluating RS G${this.gen}R${idx}:`)
                it.print()
                // train parameters?
                // split dataset?
                // evaluate performance
                // store performance in generation next to RS
                const performance = evaluator.evaluate(it)

                console.log(`Score: ${performance}`)
                this.evaluated.push({
                    score: performance,
                    recommender: it
                })
            })
        this.evaluated.sort((a,b) => b.score - a.score)

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
            .map(_ => Generation.generateRandomRS(problem))

        return new Generation(config, rs)
    }

    private static generateRandomRS(problem: ProblemInstance) {
        return new Recommender(problem)
            .init(problem.defaultConfig.generate(problem))
    }
}