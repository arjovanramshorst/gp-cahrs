import {EntityId} from "./entity.interface.ts";
import {ProblemInstance} from "./problem.interface.ts";

export interface ProcessNodeDTO {
}

export abstract class NodeProcessor<C> {
    abstract prepare(problemInstance: ProblemInstance, config: C): void

    abstract process(input: ProcessNodeDTO[], params: ProcessParams): ProcessNodeDTO
}

export interface ProcessParams {
    entityId: EntityId
}
