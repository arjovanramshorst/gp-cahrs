export {};

function mulberry32(a: number) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const main = () => {
  const seed = Math.floor(Math.random() * (2 ** 32));
  console.log(seed);
  test(seed);
  test(seed);
};

const test = (seed: number) => {
  const random = mulberry32(seed);

  for (let i = 0; i < 10; i++) {
    console.log(random());
  }
};

main();
