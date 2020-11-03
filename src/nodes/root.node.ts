import {NodeConfig} from "../interface/config.interface.ts";
import {RandomNodeConfig} from "./random.node.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {Entities} from "../interface/entity.interface.ts";
import {ProcessTreeNotInitializedError} from "../errors.ts";

interface ConfigInterface {
    interactionType: string
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
                entityType: problemInstance.interactionMap[this.config.interactionType].toType
            })
        ]
    }

    protected processorFactory(): RootNodeProcessor {
        return new RootNodeProcessor();
    }
}

export class RootNodeProcessor extends NodeProcessor<ConfigInterface> {
    private entityMap?: Entities<any>

    prepare(problemInstance: ProblemInstance, config: ConfigInterface): any {
        const toRecommendType = problemInstance.interactionMap[config.interactionType].toType
        this.entityMap = problemInstance.entityMap[toRecommendType]
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): ProcessNodeDTO {
        return {
            scores: input[0].scores,
            metadata: Object.entries(input[0].scores)
                .sort((a, b) => b[1] - a[1])
                .splice(0, 10)
                .map(([key, val]) => ({
                    score: val,
                    entity: this.entityMap?.entityMatrix[Number(key)] ?? "unknown"
                }))
        }

    }
}

