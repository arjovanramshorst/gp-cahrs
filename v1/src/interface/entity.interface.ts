export type EntityType = string;

export type EntityId = number | string;

export enum PropertyType {
  array,
  number,
  string,
  timestamp,
}

export interface BaseEntity {
  id: EntityId;
}

export interface EntitiesLight<T extends BaseEntity> {
  type: EntityType,
  properties: Record<keyof T, PropertyType>;
}

export interface Entities<T extends BaseEntity> extends EntitiesLight<T> {
  entityMatrix: Record<EntityId, T>;
}

export type EntityMap = Record<EntityType, Entities<any>>;

export type EntityMapLight = Record<EntityType, EntitiesLight<any>>