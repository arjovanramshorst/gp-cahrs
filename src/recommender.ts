import {ProcessTreeNotInitializedError} from "./errors.ts";
import {EntityId} from "./interface/entity.interface.ts";
import {ProblemInstance} from "./interface/problem.interface.ts";
import {RootNodeConfig} from "./nodes/root.node.ts";


export class Recommender {
    constructor(
        private readonly problemInstance: ProblemInstance,
    ) {
    }

    private config?: RootNodeConfig

    init(config: RootNodeConfig) {
        this.config = config.prepare(this.problemInstance)
    }

    recommend(entityId: EntityId) {
        if (!this.config) {
            throw new ProcessTreeNotInitializedError()
        }

        return this.config.process({
            entityId,
        })

    }
}

