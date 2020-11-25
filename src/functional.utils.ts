export const toMap = <A, T>(
    getIdentifier: (c: A) => number,
    mapper: (c: A) => T,
) => (agg: Record<number, T>, curr: A) => {
    const id = getIdentifier(curr)
    if (!agg[id]) {
        agg[id] = mapper(curr)
    }
    return agg
}

export const groupBy = <A>(getIdentifier: (c: A) => number) => (agg: Record<number, A[]>, curr: A) => {
    const id = getIdentifier(curr)
    if (!agg[id]) {
        agg[id] = []
    }
    agg[id].push(curr)

    return agg
}

export const sumBy = <A>(getSumBy: (c: A) => number) => (agg: number, curr: A) => agg + getSumBy(curr)

export const toMatrix = <A, T>(
    getFromIdentifier: (c: A) => number,
    getToIdentifier: (c: A) => number,
    mapper: (c: A) => T
) => (agg: Record<number, Record<number, T>>, curr: A) => {
    const fromId = getFromIdentifier(curr)
    const toId = getToIdentifier(curr)
    if (!agg[fromId]) {
        agg[fromId] = {}
    }
    agg[fromId][toId] = mapper(curr)

    return agg
}