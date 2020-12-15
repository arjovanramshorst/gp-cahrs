import {EntityId} from "../../interface/entity.interface.ts";
import {compareRecords} from "../../utils/functional.utils.ts";
import {intersection, union} from "../../utils/set.utils.ts";

type Input<T> = Record<EntityId, T>

export type ArrayComparisonType = keyof typeof ARRAY_COMPARISON

const ARRAY_COMPARISON = {
    arrayDistance
}

export default ARRAY_COMPARISON

function arrayDistance(input: Input<any>, compare?: Input<any>) {
    return compareRecords<any[]>(
        (a, b) => intersection(a, b).length / union(a, b).length
    )(input, compare)
}
