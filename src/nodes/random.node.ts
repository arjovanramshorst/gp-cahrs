import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {toMap} from "../utils/functional.utils.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores, ValueMatrix} from "../interface/dto.interface.ts";
import {getRenderer} from "../renderer.ts";

interface ConfigInterface {
    fromEntityType: string
    toEntityType: string
}


export class RandomNodeConfig extends NodeConfig<RandomNodeProcessor> {
    configType = "random-node"

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
    private scores?: ValueMatrix<number>

    prepare({entityMap}: ProblemInstance): any {
        getRenderer().updated("Generating random values..")
        const toKeys = Object.keys(entityMap[this.config.toEntityType].entityMatrix)
        this.scores = Object
            .keys(entityMap[this.config.fromEntityType].entityMatrix)
            .reduce(toMap(fromKey => Number(fromKey), () => toKeys
                .reduce(toMap(toKey => Number(toKey), () => Math.random()), {}))
            , {})
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        if (!this.scores) {
            throw Error("prepare not called")
        }
        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: {
                // Reduce size of objects passed between components
                [params.entityId]: this.scores[params.entityId]
            }
        }
    }
}