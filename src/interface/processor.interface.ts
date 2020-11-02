import {EntityId} from "./entity.interface.ts";
import {NodeConfig} from "./config.interface.ts";
import {ProblemInstance} from "./problem.interface.ts";

export interface ProcessNodeDTO {
    scores: Record<number, number>
}

export abstract class NodeProcessor<C> {
    abstract prepare(problemInstance: ProblemInstance, config: C): any

    abstract process(input: ProcessNodeDTO[], params: ProcessParams): ProcessNodeDTO
}

export interface ProcessTree {
    // processor: ProcessNode
    input: ProcessTree[]
}

export interface ProcessParams {
    entityId: EntityId
}
