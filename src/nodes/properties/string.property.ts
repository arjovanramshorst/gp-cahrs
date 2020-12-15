import {EntityId} from "../../interface/entity.interface.ts";
import {compareRecords} from "../../utils/functional.utils.ts";

type Input = Record<EntityId, string>

export type StringComparisonType = keyof typeof STRING_COMPARISON

const STRING_COMPARISON = {
    stringSame
}

export default STRING_COMPARISON

function stringSame(input: Input, compare?: Input) {
    return compareRecords(
        (a, b) => a === b ? 1 : -1
    )(input, compare)
}
