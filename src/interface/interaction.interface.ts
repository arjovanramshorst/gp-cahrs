import {EntityId, EntityType, PropertyType} from "./entity.interface.ts";
import {Matrix} from "../utils/matrix.utils.ts";

export type InteractionType = string

interface BaseInteraction {
    fromId: EntityId,
    toId: EntityId,
}

export interface Interactions<T extends BaseInteraction> {
    fromType: EntityType
    toType: EntityType
    type: InteractionType
    properties: Record<keyof T, PropertyType>
    interactionMatrix: Matrix<T>
}

export type InteractionMap = Record<InteractionType, Interactions<any>>
