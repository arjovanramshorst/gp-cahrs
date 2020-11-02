import {RootNodeConfig} from "../nodes/root.node.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";

export abstract class Problem {

    abstract defaultConfig: RootNodeConfig

    abstract async read(): Promise<ProblemInstance>
}