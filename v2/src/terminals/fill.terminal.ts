import { TerminalImplementation } from "./terminal";
import { addCount } from "../evaluate";
import { Matrix } from "../interface/util.interface";
import { NodeTerminal } from "./../interface/node.interface";
import { DTOType } from "../interface/dto.interface";
import { PropertyType } from "../interface/problem.interface";

export type FillMatrixConfig = {
  rows: number;
  columns: number;
  value: number;
};

type FillMatrixFunction = NodeTerminal<FillMatrixConfig, Matrix<number>>;

export const RandomMatrix: TerminalImplementation = {
  type: "randomMatrix",
  getOutput: () => ({
    dtoType: DTOType.matrix,
  }),
  evaluate: (config: any) => {
    // todo
  },
};

export const RandomVector: TerminalImplementation = {
  type: "randomVector",
  getOutput: () => ({
    dtoType: DTOType.vector,
    valueType: PropertyType.number,
  }),
  evaluate: (config: any) => {
    // todo
  },
};

export const RandomScalar: TerminalImplementation = {
  type: "randomScalar",
  getOutput: () => ({
    dtoType: DTOType.scalar,
  }),
  evaluate: (config: any) => {
    // todo:
  },
};

export const fillMatrix: FillMatrixFunction = (
  { rows, columns, value },
  problemInstance
) => {
  addCount();
  const a: number[][] = [];
  for (let i = 0; i < rows; i++) {
    a.push([]);
    for (let j = 0; j < columns; j++) {
      a[i].push(value);
    }
  }
  return a;
};
