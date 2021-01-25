import {NodeConfig} from "./node.ts";
import {RootNodeConfig} from "./root.node.ts";
import {PopularNodeConfig} from "./popular.node.ts";
import {PropertyNodeConfig} from "./property.node.ts";
import {RandomNodeConfig} from "./random.node.ts";
import {CFNodeConfig} from "./cf.node.ts";
import {CombineNodeConfig} from "./combine.node.ts";
import {NearestNeighbourConfig} from "./nearest-neighbour.node.ts";


export interface JsonConfig {
    type: NodeConfig<any>["configType"]
    config: any,
    input: JsonConfig[]
}

export const NodeFactory = (className: string, config: any): NodeConfig<any> => {
    switch(className) {
        case "CFNodeConfig":
            return new CFNodeConfig(config)
        case "CombineNodeConfig":
            return new CombineNodeConfig(config)
        case "NearestNeighbourConfig":
            return new NearestNeighbourConfig(config)
        case "PopularNodeConfig":
            return new PopularNodeConfig(config)
        case "PropertyNodeConfig":
            return new PropertyNodeConfig(config)
        case "RandomNodeConfig":
            return new RandomNodeConfig(config)
        case "RootNodeConfig":
            return new RootNodeConfig(config)
        default:
            throw Error(`invalid classname: ${className}`)
    }
}

export interface Generateable<G> {
    generated?: G
}

export type WithGenerated<T extends Generateable<T["generated"]>> = T & {
    generated: NonNullable<T["generated"]>
}