import {zeros} from "mathjs";
import {InteractionParams} from "../interface/problem.interface";

type EntityId = string;

export const groupBy = <A, T>(
  interactions: A[],
  getIdentifier: (c: A) => EntityId,
  mapper: (c: A) => T
): Record<EntityId, T[]> => interactions
  .reduce((agg: Record<EntityId, T[]>, curr: A) => {
    const id = getIdentifier(curr);
    if (!agg[id]) {
      agg[id] = [] as T[];
    }
    agg[id].push(mapper(curr));

    return agg;
  }, {});

export const associateWithMany = <A>(
  entities: A[],
  getMany: (c: A) => EntityId[],
  getOriginal: (c: A) => EntityId
): Record<EntityId, EntityId[]> => entities
  .reduce((agg: Record<EntityId, EntityId[]>, curr: A) => {
    getMany(curr).forEach(it => {
      if (!agg[it]) {
        agg[it] = [] as EntityId[]
      }
      agg[it].push(getOriginal(curr))
    })
    return agg
}, {})

export const asMatrix = <A>(
  params: InteractionParams,
) => {
  const matrix: number[][] = zeros([params.from.refs.length, params.to.refs.length]) as number[][]
  Object.keys(params.interactionMap).forEach(fromRef => {
    params.interactionMap[fromRef].forEach(toRef => {
      matrix[params.from.refsToIdx[fromRef]][params.to.refsToIdx[toRef]] = 1
    })
  })
  return matrix
}

export const distinct = <A>(
  entities: A[],
  getIdentifier: (c: A) => EntityId,
) => {
  const res: Record<string, boolean> = {}
  entities.forEach(it => {
    const id = getIdentifier(it)
    if (!res[id]) {
      res[id] = true
    }
  })

  return Object.keys(res)
}

export const toIdxMap = (
  agg: Record<EntityId, number>,
  curr: EntityId,
  index: number
) => {
  agg[curr] = index;
  return agg;
};

export const inputCombinations = (list: any[], amount: number) => {
  if (amount === 1) {
    return list.map((it) => [it]);
  }
  if (amount === 2) {
    return list.map((left) => list.map((right) => [left, right])).flat();
  }
  throw Error("TODO: Turn inputCombinations in recursive function")
};

export const filterUndefined = (obj: any) => {
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])
  return obj
}