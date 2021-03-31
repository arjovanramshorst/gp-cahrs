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