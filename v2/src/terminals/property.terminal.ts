import { DTOType } from '../interface/dto.interface';
import { ProblemInstance } from './../interface/problem.interface';
import { TerminalImplementation } from './terminal';

export const getPropertyTerminals = (problemInstance: ProblemInstance): TerminalImplementation[] => {
  return Object.keys(problemInstance.entities).flatMap(entityKey => {
    const entity = problemInstance.entities[entityKey]

    return Object.keys(entity.properties).map(propertyKey => {
      const property = entity.properties[propertyKey]
      return {
        type: `property(${entityKey}.${propertyKey})`,
        getOutput: () => ({
          dtoType: DTOType.vector,
          valueType: property.type,
          entity: entityKey,
          size: property.items.length
        }),
        create: () => ({

        }),
        evaluate: () => {

        }
      }
    })
  })
}