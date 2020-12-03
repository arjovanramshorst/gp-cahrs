import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessParams} from "../interface/processor.interface.ts";
import {mapMatrixValues, reduceMatrix } from "../functional.utils.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";

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