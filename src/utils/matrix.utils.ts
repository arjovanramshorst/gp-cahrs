import {EntityId} from "../interface/entity.interface.ts";
import {getRenderer} from "../renderer.ts";

export class Matrix<T extends any> {
    private scores: T[][]

    private fromRefsToIndex: Record<EntityId, number>

    private toRefsToIndex: Record<EntityId, number>

    constructor(
        private readonly fromRefs: EntityId[] = [],
        private readonly toRefs: EntityId[] = []
    ) {
        this.scores = Array(fromRefs.length)
        this.fromRefsToIndex = {}
        this.toRefsToIndex = {}

        for(let i = 0; i < fromRefs.length; i++) {
            this.scores[i] = Array(toRefs.length)
            this.fromRefsToIndex[fromRefs[i]] = i
        }
        for(let i = 0; i < toRefs.length; i++) {
            this.toRefsToIndex[toRefs[i]] = i
        }
    }

    public setByIndex(fromRefIndex: number, toRefIndex: number, value: T) {
        this.scores[fromRefIndex][toRefIndex] = value
    }

    public getRowAsObject(fromRef: EntityId) {
        const res: Record<EntityId, T> = {}
        const index = this.fromRefsToIndex[fromRef]
        for(let i = 0; i < this.toRefs.length; i++){
            const key = this.toRefs[i]
            res[key] = this.scores[index][i]
        }

        return res
    }

    public getMatrixAsObject() {
        const res: Record<EntityId, Record<EntityId, T>> = {}

        getRenderer().updated("Transforming matrix into object")
        for (let i = 0; i < this.fromRefs.length; i++) {
            getRenderer().setProgress(i, this.fromRefs.length)
            const key = this.fromRefs[i]
            res[key] = this.getRowAsObject(key)
        }

        return res
    }
}