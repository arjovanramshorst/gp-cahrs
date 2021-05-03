type EntityId = string;

export const groupBy = <A>(
  interactions: A[],
  getIdentifier: (c: A) => EntityId
): Record<EntityId, A[]> => interactions
  .reduce((agg: Record<EntityId, A[]>, curr: A) => {
    const id = getIdentifier(curr);
    if (!agg[id]) {
      agg[id] = [] as A[];
    }
    agg[id].push(curr);

    return agg;
  }, {});

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