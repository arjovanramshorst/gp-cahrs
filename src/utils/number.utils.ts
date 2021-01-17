
export {
    normalize
}

function normalize(min: number, max: number, val: number) {
    // min  = -1
    // max = 1
    return 2 * ((val - min) / (max - min)) - 1
}

function mean(arr: number[]) {
    if (arr.length === 0) {
        return 0
    }

    let x = 0
    for(let i = 0; i < arr.length; i++) {
        x += arr[i]
    }
    return x / arr.length
}