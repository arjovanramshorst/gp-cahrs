
export type StringComparisonType = keyof typeof STRING_COMPARISON

const STRING_COMPARISON = {
    stringSame
}

export default STRING_COMPARISON

function stringSame(a: string, b: string) {
    return a === b ? 1 : 0
}
