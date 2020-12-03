import {ValueMatrix} from "./interface/dto.interface.ts";
import {EntityId} from "./interface/entity.interface.ts";

export const toMap = <A, T>(
    getIdentifier: (c: A) => EntityId,
    mapper: (c: A) => T,
) => (agg: Record<EntityId, T>, curr: A) => {
    const id = getIdentifier(curr)
    if (!agg[id]) {
        agg[id] = mapper(curr)
    }
    return agg
}

export const groupBy = <A>(getIdentifier: (c: A) => EntityId) => (agg: Record<EntityId, A[]>, curr: A) => {
    const id = getIdentifier(curr)
    if (!agg[id]) {
        agg[id] = []
    }
    agg[id].push(curr)

    return agg
}

export const sumBy = <A>(getSumBy: (c: A) => number) => (agg: number, curr: A) => agg + (getSumBy(curr) ?? 0)

export const countBy = <A>(predicate: (c: A) => boolean) => (agg: number, curr: A) => agg + (predicate(curr) ? 1 : 0)

export const toMatrix = <A, T>(
    getFromIdentifier: (c: A) => EntityId,
    getToIdentifier: (c: A) => EntityId,
    mapper: (c: A) => T
) => (agg: Record<EntityId, Record<EntityId, T>>, curr: A) => {
    const fromId = getFromIdentifier(curr)
    const toId = getToIdentifier(curr)
    if (!agg[fromId]) {
        agg[fromId] = {}
    }
    agg[fromId][toId] = mapper(curr)

    return agg
}

export const mapMatrixValues = <T>(map: (t: T) => number) => (matrix: ValueMatrix<T>): ValueMatrix<number> => {
    const values: ValueMatrix<number> = {}
    Object.keys(matrix)
        .forEach(fromRef => {
            values[fromRef] = {}
            Object.keys(matrix[fromRef])
                .forEach(toRef => {
                    values[fromRef][toRef] = map(matrix[fromRef][toRef])
                })
        })

    return values
}

export const valuesOf = <T>(matrix: ValueMatrix<T>): T[] => {
    const values: T[] = []
    Object.keys(matrix)
        .forEach(fromRef => {
            Object.keys(matrix[fromRef])
                .forEach(toRef => {
                    values.push(matrix[fromRef][toRef])
                })
        })

    return values
}

type MatrixListItem<T> = { fromRef: EntityId, toRef: EntityId, value: T }

export const matrixToList = <T>(matrix: ValueMatrix<T>): MatrixListItem<T>[] => {
    const values: MatrixListItem<T>[] = []
    Object.keys(matrix)
        .forEach(fromRef => {
            Object.keys(matrix[fromRef])
                .forEach(toRef => {
                    values.push({
                        fromRef,
                        toRef,
                        value: matrix[fromRef][toRef]
                    })
                })
        })

    return values
}

export const reduceMatrix = <T, A>(reduce: (agg: T, curr: A) => T, init: T) => (matrixes: ValueMatrix<A>[]): ValueMatrix<T> => {
    const res: ValueMatrix<T> = {}
    matrixes.forEach(matrix => {
        Object.keys(matrix).forEach(fromRef => {
            if (!res[fromRef]) {
                res[fromRef] = {}
            }
            const scores = matrix[fromRef]
            Object.keys(scores).forEach(toRef => {
                if (!res[fromRef][toRef]) {
                    res[fromRef][toRef] = init
                }
                res[fromRef][toRef] = reduce(res[fromRef][toRef], scores[toRef])
            })
        })
    })

    return res
}

export const powerset = <T>(l: T[]): T[][] => {
    // stolen from https://codereview.stackexchange.com/questions/139095/generate-powerset-in-js
    return (function ps(list): any[][] {
        if (list.length === 0) {
            return [[]];
        }
        var head = list.pop();
        var tailPS = ps(list);

        return tailPS.concat(tailPS.map(function (e) {
            return [head].concat(e);
        }));
    })(l.slice())
        // Skip empty list
        .slice(1);
}