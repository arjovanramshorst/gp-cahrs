import {Reproduce} from "../gp/reproduce.ts";

export interface ConfigInterface {
    maxGeneration: number
    generationSize: number
    reproduce: () => Reproduce
}