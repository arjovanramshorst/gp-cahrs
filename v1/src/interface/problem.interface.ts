import {InteractionMap, InteractionMapLight} from "./interaction.interface.ts";
import {EntityMap, EntityMapLight} from "./entity.interface.ts";
import { RootNodeConfig } from "../nodes/root.node.ts";
import { Matrix } from "../utils/matrix.utils.ts";

export interface ProblemInstanceLight {
  defaultConfig: RootNodeConfig
  entityMap: EntityMapLight,
  interactionMap: InteractionMapLight
}

export interface ProblemInstance extends ProblemInstanceLight{
  entityMap: EntityMap;
  interactionMap: InteractionMap;

  testInteractions: Matrix<any>;
  validateInteractions: Matrix<any>;
}

