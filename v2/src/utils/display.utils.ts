export const printNested = (depth: number, str: string) => {
  const prefix = [...Array(depth)].map((it) => "  ").join("");

  console.log(`${prefix}${str}`);
};
