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

export const sumBy = <A>(getSumBy: (c: A) => number) => (agg: number, curr: A) => agg + getSumBy(curr)

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