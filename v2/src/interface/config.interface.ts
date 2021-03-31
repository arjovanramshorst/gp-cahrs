import { MatrixMathConfig } from "./../functions/math.function";

export type PossibleConfigs = FunctionConfigs | TerminalConfigs;

export type FunctionConfigs = FunctionConfig<"sum" | "multiply", MatrixMathConfig>;

export type TerminalConfigs = TerminalConfig<"fill", { rows: number, columns: number, value: number }>

export interface FunctionConfig<Type, Config> {
  type: Type;
  input: PossibleConfigs[];
  config: Config;
}

export interface TerminalConfig<Type, Config> {
  type: Type;
  config: Config;
}