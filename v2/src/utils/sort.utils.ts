import {Matrix} from "mathjs";
import {vectorGet, vectorSize} from "./matrix.utils";

export const sortIdx = (row: number[]) => {
  return Array.from(Array(row.length).keys())
    // sort descending ( TODO: Verify)
    .sort((a, b) => {
      return row[b] - row[a]
    });
};

