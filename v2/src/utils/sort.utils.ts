export const sortIdx = (row: number[]) => {
  return Array.from(Array(row.length).keys())
    .sort((a, b) => {
      return row[b] - row[a]
    });
};

export const takeTopNIdx = (row: number[], N: number) => {
  return sortIdx(row).slice(0, N)
}