import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {efficientForEach, toMap} from "../utils/functional.utils.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores, ValueMatrix} from "../interface/dto.interface.ts";
import {getRenderer} from "../renderer.ts";
import {EntityId} from "../interface/entity.interface.ts";
import {Matrix} from "../utils/matrix.utils.ts";

interface ConfigInterface {
    fromEntityType: string
    toEntityType: string
}


export class RandomNodeConfig extends NodeConfig<RandomNodeProcessor> {
    configType = `random-node `

    constructor(
        protected readonly config: ConfigInterface,
    ) {
        super()
    }

    protected generateInput() {
        return []
    }

    protected processorFactory() {
        return new RandomNodeProcessor(this.config)
    }
}

export class RandomNodeProcessor extends NodeProcessor<ConfigInterface> {
    private scores: ValueMatrix<number> = {}
    private scoresNew: Matrix<number> = new Matrix()

    prepare({entityMap}: ProblemInstance): any {
        getRenderer().updated("Generating random values..")
        const fromKeys = Object.keys(entityMap[this.config.fromEntityType].entityMatrix)
        const toKeys = Object.keys(entityMap[this.config.toEntityType].entityMatrix)

        this.scoresNew = new Matrix(fromKeys, toKeys)

        for(let i = 0; i < fromKeys.length; i++) {
            getRenderer().setProgress(i, fromKeys.length)
            for(let j = 0; j < toKeys.length; j++) {
                this.scoresNew.setByIndex(i,j, Math.random())
            }
        }
        this.scores = this.scoresNew.getMatrixAsObject()
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: this.scores,
            newMatrix: this.scoresNew
        }
    }
}