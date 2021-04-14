export const sortIdx = (row: number[]) => {
  return Array.from(Array(row.length).keys())
    .sort((a, b) => {
      return row[b] - row[a]
    });
};

