import { EntityId } from "./entity.interface.ts";
import { ProblemInstance } from "./problem.interface.ts";

export interface ProcessNodeDTO {
}

export abstract class NodeProcessor<C> {
  constructor(
    protected readonly config: C,
  ) {}

  abstract prepare(problemInstance: ProblemInstance): void;

  abstract process(
    input: ProcessNodeDTO[],
    params: ProcessParams,
  ): ProcessNodeDTO;
}

export interface ProcessParams {
  entityId: EntityId;
}
