import {ConfigInterface} from "./interface/config.interface.ts";
import {RandomReproduce} from "./gp/random.reproduce.ts";

export const defaultConfig: ConfigInterface = {
    maxGeneration: 5,
    generationSize: 5,
    reproduce: () => new RandomReproduce()
}
