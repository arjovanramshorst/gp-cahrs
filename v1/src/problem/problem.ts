import { RootNodeConfig } from "../nodes/root.node.ts";
import {ProblemInstance, ProblemInstanceLight} from "../interface/problem.interface.ts";

export abstract class Problem {
  abstract name: string;

  abstract defaultConfig: RootNodeConfig;

  abstract read(interleaveSize: number, interleaveSeed?: number): Promise<ProblemInstance>;

  abstract readLight(): ProblemInstanceLight
}
