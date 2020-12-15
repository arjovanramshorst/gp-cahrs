
export {
    normalize
}

function normalize(min: number, max: number, val: number) {
    // min  = -1
    // max = 1
    return 2 * ((val - min) / (max - min)) - 1
}
