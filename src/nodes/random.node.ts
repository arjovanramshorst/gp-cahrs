import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {toMap} from "../functional.utils.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores, ValueMatrix} from "../interface/dto.interface.ts";

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
    private scores?: ValueMatrix

    prepare({entityMap}: ProblemInstance): any {
        const toKeys = Object.keys(entityMap[this.config.toEntityType].entityMatrix)
        this.scores = Object
            .keys(entityMap[this.config.fromEntityType].entityMatrix)
            .reduce(toMap(fromKey => Number(fromKey), () => toKeys
                .reduce(toMap(toKey => Number(toKey), () => Math.random()), {}))
            , {})
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: this.scores!
        }
    }

    protected input: NodeProcessor<any>[] = [];
}