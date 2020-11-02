import {NodeConfig} from "../interface/config.interface.ts";
import {RandomNodeConfig} from "./random.node.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";

interface ConfigInterface {
    interactionType: string
}

export class RootNodeConfig extends NodeConfig<RootNodeProcessor> {
    configType = "root-node"

    constructor(
        protected readonly config: ConfigInterface
    ) { super() }

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

    prepare(problemInstance: ProblemInstance, config: ConfigInterface): any {

    }

    process(input: ProcessNodeDTO[], params: ProcessParams): ProcessNodeDTO {
        return input[0]
    }
}

