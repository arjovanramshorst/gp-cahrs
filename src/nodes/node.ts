import {ProblemInstance} from "../interface/problem.interface.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {ProcessTreeNotInitializedError} from "../errors.ts";
import {mapMatrixValues, powerset, reduceMatrix} from "../functional.utils.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";

export abstract class NodeConfig<C extends NodeProcessor<any>> {
    protected abstract readonly configType: string

    protected abstract readonly config: any

    protected input: NodeConfig<any>[] = []

    protected processor?: NodeProcessor<any>

    protected abstract generateInput(problemInstance: ProblemInstance): NodeConfig<any>[]

    /**
     * TODO: Possibly generate all possible input configurations and randomly select one?
     *
     * Generates a random valid input configuration.
     *
     * @param problemInstance
     */
    public generate(problemInstance: ProblemInstance) {
        const input = NodeConfig.selectRandom(this.generateInput(problemInstance))
        input.forEach(it => it.generate(problemInstance))

        if (input.length > 1) {
            const combine = new CombineNodeConfig({
                type: "Similarity",
                entityType: "any"
            })
            combine.setInput(input)
            this.input = [combine]
        } else {
            this.input = input
        }

        return this
    }

    /**
     * Recursively prepares the input nodes, and finally the current one.
     *
     * @param problemInstance
     */
    public prepare(problemInstance: ProblemInstance) {
        this.processor = this.processorFactory()
        this.input.forEach(it => it.prepare(problemInstance))

        this.processor.prepare(problemInstance, this.config)
        return this
    }

    /**
     * Recursively processes the input, and finally returns the value as processed by this processor
     *
     * @param params
     */
    public process(params: ProcessParams): ProcessNodeDTO {
        if (!this.processor) {
            throw new ProcessTreeNotInitializedError()
        }
        const input = this.input.map(it => it.process(params))

        return this.processor.process(input, params)
    }

    public print(indent: number = 0): void {
        console.log(`${[...Array(indent)].map(_ => "| ").join("")}${this.configType}`)
        this.input.forEach(it => it.print(indent + 1))
    }

    protected abstract processorFactory(): NodeProcessor<any>

    private static selectRandom(input: NodeConfig<any>[]): NodeConfig<any>[] {
        if (input.length <= 1) {
            return input
        }

        const ps = powerset(input)

        return ps[Math.floor(Math.random() * ps.length)]
    }
}

/**
 * Everything below this part is only here (and not in its own file) due to the fact that singular dependencies don't work
 * in ts/deno/node.
 *
 * TODO: Figure out a cleaner way to handle this
 */

interface ConfigInterface {
    type: "Similarity" // | "CFMatrix"
    entityType: string
}


export class CombineNodeConfig extends NodeConfig<CombineNodeProcessor> {
    configType = "combine-node"

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput() {
        return []
    }

    public setInput(input: NodeConfig<any>[]) {
        this.input = input
    }

    protected processorFactory() {
        return new CombineNodeProcessor(this.config)
    }
}

export class CombineNodeProcessor extends NodeProcessor<ConfigInterface> {

    prepare(instance: ProblemInstance, config: ConfigInterface): any {

    }

    process(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
        // TODO: check inputs from/to are the same
        // start with avg only
        const sumFunc = (agg: Sum, curr: number) => ({
            sum: agg.sum + curr,
            count: agg.count + 1,
        })
        const combineValues = reduceMatrix(sumFunc, {sum: 0, count: 0})(input.map(it => it.matrix))

        return {
            fromEntityType: input[0].fromEntityType,
            toEntityType: input[0].toEntityType,
            matrix: mapMatrixValues((it: Sum) => it.sum / it.count)(combineValues)
        }
    }
}

interface Sum {
    sum: number
    count: number
}