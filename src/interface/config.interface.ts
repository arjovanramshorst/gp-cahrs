import {ProblemInstance} from "./problem.interface.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "./processor.interface.ts";
import {ProcessTreeNotInitializedError} from "../errors.ts";

export abstract class NodeConfig<C extends NodeProcessor<any>> {
    protected abstract readonly configType: string

    protected abstract readonly config: any

    protected input: NodeConfig<any>[] = []

    protected processor?: NodeProcessor<any>

    protected abstract generateInput(problemInstance: ProblemInstance): NodeConfig<any>[]

    public generate(problemInstance: ProblemInstance) {
        this.input = this.generateInput(problemInstance)
        this.input.forEach(it => it.generate(problemInstance))
        return this
    }

    public prepare(problemInstance: ProblemInstance) {
        this.processor = this.processorFactory()
        this.processor.prepare(problemInstance, this.config)
        this.input.forEach(it => it.prepare(problemInstance))
        return this
    }

    public process(params: ProcessParams): ProcessNodeDTO {
        if (!this.processor) {
            throw new ProcessTreeNotInitializedError()
        }
        const input = this.input.map(it => it.process(params))

        return this.processor.process(input, params)
    }

    protected abstract processorFactory(): NodeProcessor<any>
}

