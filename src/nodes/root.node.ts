import {NodeConfig} from "./node.ts";
import {RandomNodeConfig} from "./random.node.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {Entities} from "../interface/entity.interface.ts";
import {Recommendations, SimilarityScores} from "../interface/dto.interface.ts";

interface ConfigInterface {
    interactionType: string,
    type: "exist" | "maximize" | "minimize"
    property?: string // keyof?
}

export class RootNodeConfig extends NodeConfig<RootNodeProcessor> {
    configType = "root-node"

    constructor(
        protected readonly config: ConfigInterface
    ) {
        super()
    }

    generateInput(problemInstance: ProblemInstance): RandomNodeConfig[] {
        return [
            new RandomNodeConfig({
                toEntityType: problemInstance.interactionMap[this.config.interactionType].toType,
                fromEntityType: problemInstance.interactionMap[this.config.interactionType].fromType
            })
        ]
    }

    protected processorFactory(): RootNodeProcessor {
        return new RootNodeProcessor(this.config);
    }
}

export class RootNodeProcessor extends NodeProcessor<ConfigInterface> {
    private entityMap?: Entities<any>
    private interactionType?: string

    prepare(problemInstance: ProblemInstance, config: ConfigInterface): any {
        this.interactionType = config.interactionType
        const toRecommendType = problemInstance.interactionMap[config.interactionType].toType
        this.entityMap = problemInstance.entityMap[toRecommendType]
    }

    // TODO: Allow list of entities in ProcessParams, to be returned sorted, for evaluation purposes
    process(input: SimilarityScores[], params: ProcessParams): Recommendations {
        if (input.length !== 1) {
            throw Error("Invalid input length")
        }

        const result = Object.entries(input[0].matrix[params.entityId])
            .sort((a, b) => b[1] - a[1])
            .splice(0, 10)
            .map(([key, val]) => ({
                score: val,
                entity: this.entityMap?.entityMatrix[Number(key)] ?? "unknown"
            }))

        // Handle user-user similarity
        // Handle item-item similarity
        // handle user-item similarity
        // Combine both approaches
        // Return top N list
        return {
            interactionType: this.interactionType!,
            recommendations: result
        }
    }
}

