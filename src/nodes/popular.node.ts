import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";
import {SparseMatrix} from "../utils/matrix.utils.ts";
import {EntityId} from "../interface/entity.interface.ts";

interface ConfigInterface {
    interactionType: string
    compareValueKey?: string
}


export class PopularNodeConfig extends NodeConfig<PopularNodeProcessor> {
    configType = "popular-node"

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput() {
        return []
    }

    protected processorFactory() {
        return new PopularNodeProcessor(this.config)
    }
}

export class PopularNodeProcessor extends NodeProcessor<ConfigInterface> {
    private popularity: Record<EntityId, number> = {}
    private fromType?: string
    private toType?: string

    prepare({entityMap, interactionMap}: ProblemInstance): any {
        const interaction = interactionMap[this.config.interactionType]
        this.fromType = interaction.fromType
        this.toType = interaction.toType
        interaction.interactionMatrix.getToRefs()
            .forEach(toRef => {
                this.popularity[toRef] = Object.keys(interaction.interactionMatrix.getColumn(toRef)).length
            })

    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        if (!this.popularity || !this.fromType || !this.toType) {
            throw Error("prepare not called")
        }

        return {
            fromEntityType: this.fromType ?? "",
            toEntityType: this.toType ?? "",
            matrix: SparseMatrix.fromToVector(params.entityId, this.popularity)
        }
    }
}