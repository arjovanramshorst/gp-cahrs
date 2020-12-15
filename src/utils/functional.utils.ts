import {ValueMatrix} from "../interface/dto.interface.ts";
import {EntityId} from "../interface/entity.interface.ts";

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

export const listToMatrix = <T>(input: MatrixListItem<T>[], symmetric = false): ValueMatrix<T> => {
    const res: ValueMatrix<T> = {}
    input.forEach(it => {
        if (!res[it.fromRef]) {
            res[it.fromRef] = {}
        }
        if (!res[it.toRef]) {
            res[it.toRef] = {}
        }
        res[it.fromRef][it.toRef] = it.value
        if (symmetric) {
            res[it.toRef][it.fromRef] = it.value
        }
    })
    return res
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

export const mapRecord = <T, A>(map: (t: T) => A) => (i: Record<any, T>) => Object.keys(i)
    .reduce((agg, key) => {
        agg[key] = map(i[key])
        return agg
    }, {} as Record<any, A>)

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

export const compareRecord = <T>(
    compare: (a: T, b: T) => number,
    preprocess?: (a: T) => T,
    postProcess?: (a: number[]) => (b: number) => number
) => (
    record: Record<EntityId, T>
): ValueMatrix<number> => {
    const keys = Object.keys(record)
    const items = []
    for (let i = 0; i < keys.length - 1; i++) {
        const fromRef = keys[i]
        const fromValue = preprocess ? preprocess(record[fromRef]) : record[fromRef]
        for (let j = i + 1; j < keys.length; j++) {
            const toRef = keys[j]
            const toValue = preprocess ? preprocess(record[toRef]) : record[toRef]
            items.push({
                fromRef,
                toRef,
                value: compare(fromValue, toValue)
            })
        }
    }
    if (postProcess) {
        const func = postProcess(items.map(it => it.value))
        return listToMatrix(items.map(it => ({
            ...it,
            value: func(it.value)
        })), true)
    } else {
        return listToMatrix(items, true)
    }
}

export const compareRecords = <T>(
    compare: (a: T, b: T) => number,
    preprocess?: (a: T) => T,
    postProcess?: (a: number[]) => (b: number) => number
) => (
    fromRecord: Record<EntityId, T>,
    toRecord?: Record<EntityId, T>
): ValueMatrix<number> => {
    if (!toRecord) {
        return compareRecord(compare, preprocess)(fromRecord)
    }
    const items: MatrixListItem<number>[] = []
    Object.keys(fromRecord).forEach(fromRef => {
        const fromValue = preprocess ? preprocess(fromRecord[fromRef]) : fromRecord[fromRef]
        Object.keys(toRecord).forEach(toRef => {
            const toValue = preprocess ? preprocess(toRecord[toRef]) : toRecord[toRef]
            items.push({
                fromRef,
                toRef,
                value: compare(fromValue, toValue)
            })
        })
    })

    // TODO: Combine in to one function with above,
    if (postProcess) {
        const func = postProcess(items.map(it => it.value))
        return listToMatrix(items.map(it => ({
            ...it,
            value: func(it.value)
        })), false)
    } else {
        return listToMatrix(items, false)
    }
}

// TODO: Is this actually efficient? :p (cries)
export const efficientForEach = <T>(
    func: (fromKey: string, fromVal: T, toKey: string, toVal: T) => void
) => (
    fromRecord: Record<EntityId, T>,
    toRecord?: Record<EntityId, T>
) => {
    if (toRecord) {
        Object.keys(fromRecord).forEach(fromRef => {
            Object.keys(toRecord).forEach(toRef => {
                func(fromRef, fromRecord[fromRef], toRef, toRecord[toRef])
            })
        })
    } else {
        const keys = Object.keys(fromRecord)
        for (let i = 0; i < keys.length; i++) {
            for (let j = i; j < keys.length; j++) {
                func(keys[i], fromRecord[keys[i]], keys[j], fromRecord[keys[j]])
            }
        }
    }
}