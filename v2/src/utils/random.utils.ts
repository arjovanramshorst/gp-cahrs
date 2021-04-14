/**
 * Generates a random seed to be used by the 32 bit mulberry random function
 */
export const generateMulberrySeed = () => Math.floor(Math.random() * 2 ** 32);

/**
 * Returns a seeded PRNG, based on this answer from SO:
 *
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 *
 * @param Hexadecimal seed value
 */
export const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const selectRandom = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]

export const pick = <T extends any>(k: number = 1, PRG: () => number = () => Math.random()) =>
  (...from: T[]): T[] =>
    [...new Array(k)].map((_) => from[Math.floor(PRG() * from.length)]);


/**
 * Modified version of https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array/61078260#61078260
 *
 * Chooses k unique random elements from pool.
 */
export const sample = <T extends any>(
  pool: T[],
  k: number,
  PRG: () => number = Math.random,
): T[] => {
  let n = pool.length;

  if (k < 0 || k > n)
    throw new RangeError("Sample larger than population or is negative");

  // If k is larger than a certain number, removes items from the original array if selected, otherwise it just uses
  // a naive implementation
  if (n <= (k <= 5 ? 21 : 21 + Math.pow(4, Math.ceil(Math.log(k * 3) / Math.log(4))))) {
    const poolCopy = pool.slice();

    for (let i = 0; i < k; i++) { // invariant: non-selected at [i,n)
      let j = i + PRG() * (n - i) | 0;
      let x = poolCopy[i];
      poolCopy[i] = poolCopy[j];
      poolCopy[j] = x;
    }
    poolCopy.length = k; // truncate

    return poolCopy;
  } else {
    const selected = new Set<number>();

    while (selected.size < k) {
      selected.add(PRG() * n | 0)
    }
    return Array.from(selected).map(i => pool[i]);
  }
}