import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores, ValueMatrix} from "../interface/dto.interface.ts";
import {Entities, EntityId, PropertyType} from "../interface/entity.interface.ts";
import {efficientForEach, mapMatrixValues, mapRecord} from "../utils/functional.utils.ts";
import STRING_COMPARISON from "./properties/string.property.ts";
import NUMBER_COMPARISON from "./properties/number.property.ts";
import ARRAY_COMPARISON from "./properties/array.property.ts";
import {compare, ComparisonType} from "./properties/property.ts";
import {getRenderer} from "../renderer.ts";
import {Matrix} from "../utils/matrix.utils.ts";


interface ConfigInterface {
    comparisonType: ComparisonType

    fromEntityType: string,
    toEntityType: string,

    fromKey: string,
    toKey: string,

}

export class PropertyNodeConfig extends NodeConfig<PropertyNodeProcessor> {
    protected readonly configType = `property-node (${this.config.comparisonType})`

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput(problemInstance: ProblemInstance): NodeConfig<any>[] {
        return [];
    }

    protected processorFactory(): NodeProcessor<any> {
        return new PropertyNodeProcessor(this.config)
    }

    /**
     * Returns a list of potential configs given two entities
     * @param fromEntities
     * @param toEntities
     * @constructor
     */
    static PotentialConfigs(fromEntities: Entities<any>, toEntities?: Entities<any>): PropertyNodeConfig[] {
        const res: PropertyNodeConfig[] = []

        efficientForEach<PropertyType>(
            (fromKey, fromType, toKey, toType) => {
                if (fromType === toType) {
                    getComparisons(fromType)
                        .forEach(comparisonType => {
                            res.push(new PropertyNodeConfig({
                                comparisonType,
                                fromKey,
                                toKey,
                                fromEntityType: fromEntities.type,
                                toEntityType: toEntities?.type ?? fromEntities.type
                            }))
                        })
                }
            }
        )(fromEntities.properties, toEntities?.properties)

        return res
    }
}


export class PropertyNodeProcessor extends NodeProcessor<ConfigInterface> {

    private scores: Matrix<number> = new Matrix([],[])
    private oldScores = {}

    prepare({entityMap} : ProblemInstance): void {

        const compareFunction = compare(this.config.comparisonType)

        const fromEntities = entityMap[this.config.fromEntityType].entityMatrix
        const fromKeys = Object.keys(fromEntities)

        const toEntities = entityMap[this.config.toEntityType].entityMatrix
        const toKeys = Object.keys(toEntities)

        this.scores = new Matrix(fromKeys, toKeys)
        const fromInput = fromKeys.map(key => fromEntities[key][this.config.fromKey])
        const toInput = toKeys.map(key => toEntities[key][this.config.toKey])

        for(let i = 0; i < fromKeys.length; i++) {
            getRenderer().setProgress(i, fromKeys.length)

            for (let j = 0; j < toKeys.length; j++) {
                // this.scores[i][j] = fromInput[i] === toInput[j] ? 1 : 0
                this.scores.setByIndex(i, j, compareFunction(fromInput[i], toInput[j]))
            }
        }
        this.oldScores = this.scores.getMatrixAsObject()
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        if (input.length !== 0) {
            throw Error("Should never have input.")
        }

        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: this.oldScores,
            newMatrix: this.scores
        }
    }
}

function getComparisons(type: PropertyType): ComparisonType[] {
    switch (type) {
        case PropertyType.array:
            return [] //Object.keys(ARRAY_COMPARISON) as ComparisonType[]
        case PropertyType.number:
            return Object.keys(NUMBER_COMPARISON) as ComparisonType[]
        case PropertyType.string:
            return Object.keys(STRING_COMPARISON) as ComparisonType[]
        default:
            return []
    }
}