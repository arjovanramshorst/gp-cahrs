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

export interface Entities<T extends BaseEntity> {
  type: EntityType;
  properties: Record<keyof T, PropertyType>;
  entityMatrix: Record<EntityId, T>;
}

export type EntityMap = Record<EntityType, Entities<any>>;
