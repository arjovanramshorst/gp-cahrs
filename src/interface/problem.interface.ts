import {InteractionMap} from "./interaction.interface.ts";
import {EntityMap} from "./entity.interface.ts";

export interface ProblemInstance {
    entityMap: EntityMap,
    interactionMap: InteractionMap
}