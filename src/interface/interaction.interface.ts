import {EntityId, EntityType, PropertyType} from "./entity.interface.ts";

export type InteractionType = string

interface BaseInteraction {
    fromId: EntityId,
    toId: EntityId,
}

interface Interactions<T extends BaseInteraction> {
    fromType: EntityType
    toType: EntityType
    type: InteractionType
    properties: Record<keyof T, PropertyType>
    interactionMatrix: Record<EntityId, Record<EntityId, T>>
}

export type InteractionMap = Record<InteractionType, Interactions<any>>
