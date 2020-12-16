import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {matrixToList, toMap} from "../utils/functional.utils.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores, ValueMatrix} from "../interface/dto.interface.ts";
import {EntityId} from "../interface/entity.interface.ts";
import {Matrix} from "../utils/matrix.utils.ts";

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
    private scores: Record<EntityId, number> = {}
    private fromType?: string
    private toType?: string

    prepare({entityMap, interactionMap}: ProblemInstance): any {
        const interaction = interactionMap[this.config.interactionType]
        this.fromType = interaction.fromType
        this.toType = interaction.toType
        this.scores = {}

        matrixToList(interaction.interactionMatrix)
            .forEach(it => {
                if (!this.scores[it.toRef]) {
                    this.scores[it.toRef] = 0
                }
                this.scores[it.toRef]++
            })
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        if (!this.scores || !this.fromType || !this.toType) {
            throw Error("prepare not called")
        }

        return {
            fromEntityType: this.fromType ?? "",
            toEntityType: this.toType ?? "",
            matrix: {
                [params.entityId]: this.scores
            }
        }
    }
}