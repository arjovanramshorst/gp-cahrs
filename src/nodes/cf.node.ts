import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {toMap} from "../functional.utils.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";

interface ConfigInterface {
    entityType: string
}


export class CFNodeConfig extends NodeConfig<CFNodeProcessor> {
    configType = "cf-node"

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput() {
        return []
    }

    protected processorFactory() {
        return new CFNodeProcessor()
    }
}

export class CFNodeProcessor extends NodeProcessor<ConfigInterface> {
    private scores?: Record<number, number>

    prepare({entityMap}: ProblemInstance, config: ConfigInterface): any {
        this.scores = Object
            .keys(entityMap[config.entityType].entityMatrix)
            .reduce(toMap(c => Number(c), () => Math.random()), {})
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): ProcessNodeDTO {
        return {
            scores: this.scores!
        }
    }

    protected input: NodeProcessor<any>[] = [];
}