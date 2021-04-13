import {Matrix} from "mathjs";
import {vectorGet, vectorSize} from "./matrix.utils";

export const sortIdx = (row: Matrix) => {
  return Array.from(Array(vectorSize(row)).keys())
    // sort descending ( TODO: Verify)
    .sort((a, b) => {
      const res = vectorGet(row, a) - vectorGet(row, b)
      return res
    });
};

