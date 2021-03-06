import {DTOMatrix, DTOType, DTOVector} from '../interface/dto.interface';
import {ProblemInstance} from '../interface/problem.interface';
import {TerminalImplementation} from './terminal';

export const getPropertyTerminals = (problemInstance: ProblemInstance): TerminalImplementation<{}>[] => {
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
        }) as DTOVector,
        evaluate: () => property.items
      }
    })
  })
}

export const getInteractionPropertyTerminals = (problemInstance: ProblemInstance): TerminalImplementation<{}>[] => {
  return Object.keys(problemInstance.interactions).map(interactionKey => {
    const interaction = problemInstance.interactions[interactionKey]
    const [rows, cols] = [interaction.interactions.length, interaction.interactions[0].length]
    return {
      type: `interaction(${interaction.type})`,
      getOutput: () => ({
        dtoType: DTOType.matrix,
        fromEntity: interaction.fromEntityType,
        toEntity: interaction.toEntityType,
      }) as DTOMatrix,
      evaluate: (config, problem) => interaction.interactions
    }
  })
}