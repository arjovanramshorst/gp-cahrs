import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";
import {getRenderer} from "../renderer.ts";
import {DenseMatrix, VectorMatrix} from "../utils/matrix.utils.ts";
import {EntityId} from "../interface/entity.interface.ts";

interface ConfigInterface {
    fromEntityType: string
    toEntityType: string
}


export class RandomNodeConfig extends NodeConfig<RandomNodeProcessor> {
    configType = `random-node `

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput() {
        return []
    }

    protected processorFactory() {
        return new RandomNodeProcessor(this.config)
    }
}

export class RandomNodeProcessor extends NodeProcessor<ConfigInterface> {
    private scores: Record<EntityId, number> = {}

    prepare({entityMap}: ProblemInstance): any {
        getRenderer().updated("Generating random values..")
        const toKeys = Object.keys(entityMap[this.config.toEntityType].entityMatrix)

        const randomValues = toKeys.reduce((agg, key) => {
            agg[key] = Math.random()
            return agg
        }, {} as Record<EntityId, number>)

        this.scores = randomValues
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: new VectorMatrix(params.entityId, this.scores)
        }
    }
}