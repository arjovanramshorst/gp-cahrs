import {DTO} from "./dto.interface";
import {NodeConfig} from "../tree";

export interface NodeImplementation<T extends Omit<NodeConfig, "type">> {
  type: string;
  createConfig?: (output?: DTO) => T;
}
