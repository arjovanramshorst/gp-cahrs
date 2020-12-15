import {EntityId} from "../../interface/entity.interface.ts";
import {compareRecords} from "../../utils/functional.utils.ts";
import {normalize} from "../../utils/number.utils.ts";

type Input = Record<EntityId, number>

export type NumberComparisonType = keyof typeof NUMBER_COMPARISON

const NUMBER_COMPARISON = {
    numberDistance
}

export default NUMBER_COMPARISON

function numberDistance(input: Input, compare?: Input) {
    return compareRecords<number>(
        (a, b) => Math.abs(a - b),
        undefined,
        res => {
            // normalize and invert!
            const max = Math.max(...res)
            const min = Math.min(...res)
            return val => normalize(max, min, val) * -1
        }
    )(input, compare)
}

