import { ProblemInstance } from './problem.interface';

export type NodeFunction<Config, Input, Output> = (config: Config, input: Input) => Output

export type NodeTerminal<Config, Output> = (config: Config, problemInstance: ProblemInstance) => Output