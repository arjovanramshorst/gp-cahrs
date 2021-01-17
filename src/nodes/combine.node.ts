import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessParams} from "../interface/processor.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";
import {SparseMatrix} from "../utils/matrix.utils.ts";

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

    public setCombineInput(input: NodeConfig<any>[]) {
        this.input = input
    }

    protected processorFactory() {
        return new CombineNodeProcessor(this.config)
    }
}

export class CombineNodeProcessor extends NodeProcessor<ConfigInterface> {

    prepare(instance: ProblemInstance): void {

    }

    process(input: SimilarityScores[], params: ProcessParams): SimilarityScores {
        // TODO: check inputs from/to are the same
        // start with avg only
        const avg = (arr: number[]) => arr.reduce((agg, curr) => agg + curr, 0) / arr.length

        return {
            fromEntityType: input[0].fromEntityType,
            toEntityType: input[0].toEntityType,
            matrix: SparseMatrix.combine(input.map(it => it.matrix), avg)
        }
    }
}

interface Sum {
    sum: number
    count: number
}