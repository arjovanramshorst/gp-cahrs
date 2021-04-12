type EntityId = string;

export const groupBy = <A>(getIdentifier: (c: A) => EntityId) => (
  agg: Record<EntityId, A[]>,
  curr: A
): Record<EntityId, A[]> => {
  const id = getIdentifier(curr);
  if (!agg[id]) {
    agg[id] = [];
  }
  agg[id].push(curr);

  return agg;
};

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