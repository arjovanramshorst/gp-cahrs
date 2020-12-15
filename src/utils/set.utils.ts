export {
    intersection,
    union
}

function intersection<T>(a: T[], b: T[]): T[] {
    return a.filter(it => b.includes(it))
}

function union<T>(a: T[], b: T[]): T[] {
    return [...new Set([...a, ...b])]
}

