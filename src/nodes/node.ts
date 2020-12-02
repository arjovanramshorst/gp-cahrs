import {ProblemInstance} from "../interface/problem.interface.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {ProcessTreeNotInitializedError} from "../errors.ts";
import {CombineNodeConfig} from "./combine.node.ts";
import {powerset} from "../functional.utils.ts";

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

        // TODO: Implement combiner here if there is more than one input generated
        // if (input.length > 1) {
        //     const combine = new CombineNodeConfig({})
        //     combine.setInput(input)
        //     this.input = [combine]
        // } else {
            this.input = input
        // }

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
        // TODO: Add combine node here if selected.length > 1 and this node is not a combiner
    }
}

