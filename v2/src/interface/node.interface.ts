import {DTO} from "./dto.interface";

export interface NodeImplementation {
  type: string;
  createConfig?: (output: DTO) => any;
}
