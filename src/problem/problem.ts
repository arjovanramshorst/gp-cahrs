import {RootNodeConfig} from "../nodes/root.node.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";

export abstract class Problem {
    abstract name: string

    abstract defaultConfig: RootNodeConfig

    abstract read(): Promise<ProblemInstance>
}