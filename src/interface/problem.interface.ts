import {InteractionMap} from "./interaction.interface.ts";
import {EntityMap} from "./entity.interface.ts";
import {RootNodeConfig} from "../nodes/root.node.ts";

export interface ProblemInstance {
    defaultConfig: RootNodeConfig
    entityMap: EntityMap,
    interactionMap: InteractionMap
}