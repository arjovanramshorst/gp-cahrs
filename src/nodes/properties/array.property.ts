import {intersection} from "../../utils/set.utils.ts";

export type ArrayComparisonType = keyof typeof ARRAY_COMPARISON

const ARRAY_COMPARISON = {
    arrayDistance,
}

export default ARRAY_COMPARISON

function arrayDistance(a: any[], b: any[]) {
    const l = intersection(a, b).length
    return l / (a.length + b.length - l)
}
