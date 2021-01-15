import {InteractionMap} from "./interaction.interface.ts";
import {EntityMap} from "./entity.interface.ts";
import {RootNodeConfig} from "../nodes/root.node.ts";
import {Matrix} from "../utils/matrix.utils.ts";

export interface ProblemInstance {
    defaultConfig: RootNodeConfig
    entityMap: EntityMap,
    interactionMap: InteractionMap,

    testInteractions: Matrix<any>
}
