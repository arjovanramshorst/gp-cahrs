import {EntityId} from "../interface/entity.interface.ts";
import {isDefined} from "./filter.utils.ts";

export abstract class Matrix<T> {
    public abstract get(fromRef: EntityId, toRef: EntityId): T | undefined

    public abstract set(fromRef: EntityId, toRef: EntityId, value: T): void

    public abstract getRow(fromRef: EntityId): Record<EntityId, T>

    public abstract getColumn(toRef: EntityId): Record<EntityId, T>

    public abstract getFromRefs(): EntityId[]

    public abstract getToRefs(): EntityId[]

    public abstract map<K>(mapper: (items: T[]) => K[]): Matrix<K>
}

export class DenseMatrix<T extends any> extends Matrix<T> {
    private scores: T[][]

    private fromRefsToIndex: Record<EntityId, number>

    private toRefsToIndex: Record<EntityId, number>

    constructor(
        private readonly fromRefs: EntityId[] = [],
        private readonly toRefs: EntityId[] = []
    ) {
        super()
        this.scores = Array(fromRefs.length)
        this.fromRefsToIndex = {}
        this.toRefsToIndex = {}

        for (let i = 0; i < fromRefs.length; i++) {
            this.scores[i] = Array(toRefs.length)
            this.fromRefsToIndex[fromRefs[i]] = i
        }
        for (let i = 0; i < toRefs.length; i++) {
            this.toRefsToIndex[toRefs[i]] = i
        }
    }

    public get = (fromRef: EntityId, toRef: EntityId) => {
        return this.scores[this.fromRefsToIndex[fromRef]][this.toRefsToIndex[toRef]]
    }

    public set = (fromRef: EntityId, toRef: EntityId, value: T) => {
        this.scores[this.fromRefsToIndex[fromRef]][this.toRefsToIndex[toRef]] = value
    }

    public getRow = (fromRef: EntityId): Record<EntityId, T> => {
        const res: Record<EntityId, T> = {}
        const fromIndex = this.fromRefsToIndex[fromRef]
        for (let i = 0; i < this.toRefs.length; i++) {
            res[this.toRefs[i]] = this.scores[fromIndex][i]
        }

        return res
    }

    public getColumn = (toRef: EntityId): Record<EntityId, T> => {
        const res: Record<EntityId, T> = {}
        const toIndex = this.toRefsToIndex[toRef]
        for (let i = 0; i < this.fromRefs.length; i++) {
            res[this.fromRefs[i]] = this.scores[i][toIndex]
        }

        return res
    }

    public getFromRefs = (): EntityId[] => {
        return this.fromRefs
    }

    public getToRefs = (): EntityId[] => {
        return this.toRefs
    }

    public setByIndex(fromRefIndex: number, toRefIndex: number, value: T) {
        this.scores[fromRefIndex][toRefIndex] = value
    }

    public map = <K>(mapper: (items: T[]) => K[]) => {
        const matrix = new DenseMatrix<K>(this.fromRefs, this.toRefs)
        matrix.setItems(mapper(this.getItems()))

        return matrix
    }

    private getItems = (): T[] => {
        return ([] as T[]).concat(...this.scores)
    }

    private setItems = (items: T[]) => {
        if (items.length !== this.fromRefs.length * this.toRefs.length) {
            throw Error("Invalid amount of items for setItems")
        }
        for (let i = 0; i < this.fromRefs.length; i+=this.toRefs.length) {
            this.scores[i] = items.slice(i, i+this.toRefs.length)
        }
    }
}


export class SparseMatrix<T extends any> extends Matrix<T> {
    constructor(
        private readonly items: T[] = [],
        private readonly itemToFromRef: EntityId[] = [],
        private readonly itemToToRef: EntityId[] = [],
        private readonly matrix: Record<EntityId, Record<EntityId, number>> = {},
        private readonly invertedMatrix: Record<EntityId, Record<EntityId, number>> = {}
    ) {
        super()
    }

    public set(fromRef: EntityId, toRef: EntityId, value: T) {
        if (!this.matrix[fromRef]) {
            this.matrix[fromRef] = {}
        }

        if (!this.invertedMatrix[toRef]) {
            this.invertedMatrix[toRef] = {}
        }

        if (this.matrix[fromRef][toRef]) {
            // item already exists, update:
            this.items[this.matrix[fromRef][toRef]] = value
        } else {
            // Add item to items, and store index
            const newLength = this.items.push(value)
            this.itemToFromRef.push(fromRef)
            this.itemToToRef.push(toRef)
            this.matrix[fromRef][toRef] = newLength - 1
            this.invertedMatrix[toRef][fromRef] = newLength - 1
        }
    }

    public get(fromRef: EntityId, toRef: EntityId) {
        if (!this.matrix[fromRef]) {
            return undefined
        }

        return this.items[this.matrix[fromRef][toRef]]
    }

    public getFromRefs() {
        return Object.keys(this.matrix)
    }

    public getToRefs() {
        return Object.keys(this.invertedMatrix)
    }

    public getRow = (fromRef: EntityId): Record<EntityId, T> => {
        if (!this.matrix[fromRef]) {
            return {}
        }

        return Object.keys(this.matrix[fromRef]).reduce((agg, toRef) => {
            agg[toRef] = this.get(fromRef, toRef) as T
            return agg
        }, {} as Record<EntityId, T>)
    }

    public getColumn = (toRef: EntityId) => {
        return Object.keys(this.invertedMatrix[toRef]).reduce((agg, fromRef) => {
            agg[fromRef] = this.get(fromRef, toRef) as T
            return agg
        }, {} as Record<EntityId, T>)
    }

    public map = <K>(mapper: (val: T[]) => K[]): SparseMatrix<K> => {
        return new SparseMatrix(mapper(this.items), this.itemToFromRef, this.itemToToRef, this.matrix, this.invertedMatrix)
    }


    static fromArray<T, K = T>(
        fromRef: RefFunc<T>,
        toRef: RefFunc<T>,
        mapper: (val: T) => K,
        array: T[]
    ): SparseMatrix<K> {
        const matrix = new SparseMatrix<K>()

        for (let i = 0; i < array.length; i++) {
            const val = array[i]
            matrix.set(fromRef(val), toRef(val), mapper(array[i]))
        }

        return matrix
    }

    static fromToVector<T>(fromRef: EntityId, toVector: Record<EntityId, T>): SparseMatrix<T> {
        const matrix = new SparseMatrix<T>()
        Object.keys(toVector)
            .forEach(toRef => matrix.set(fromRef, toRef, toVector[toRef]))

        return matrix
    }

    // TODO: Move this to Matrix class, and let that one decide which type of matrix it returns
    static combine<T, K = T>(input: Matrix<T>[], func: (input: T[]) => K) {
        const fromRefs = [...new Set([...input.flatMap(it => it.getFromRefs())])]
        const toRefs = [...new Set([...input.flatMap(it => it.getToRefs())])]
        const matrix = new SparseMatrix<K>()
        for (let i = 0; i < fromRefs.length; i++) {
            for (let j = 0; j < toRefs.length; j++) {
                const res = input.map(it => it.get(fromRefs[i], toRefs[j])).filter(isDefined) as T[]
                matrix.set(fromRefs[i], toRefs[j], func(res))
            }
        }
        return matrix
    }
}

type RefFunc<T> = (f: T) => EntityId