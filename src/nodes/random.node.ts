import {NodeConfig} from "./node.ts";
import {NodeProcessor, ProcessNodeDTO, ProcessParams} from "../interface/processor.interface.ts";
import {ProblemInstance} from "../interface/problem.interface.ts";
import {SimilarityScores} from "../interface/dto.interface.ts";
import {getRenderer} from "../renderer.ts";
import {DenseMatrix} from "../utils/matrix.utils.ts";

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
    private scores: DenseMatrix<number> = new DenseMatrix()

    prepare({entityMap}: ProblemInstance): any {
        getRenderer().updated("Generating random values..")
        const fromKeys = Object.keys(entityMap[this.config.fromEntityType].entityMatrix)
        const toKeys = Object.keys(entityMap[this.config.toEntityType].entityMatrix)

        this.scores = new DenseMatrix(fromKeys, toKeys)

        for(let i = 0; i < fromKeys.length; i++) {
            getRenderer().setProgress(i, fromKeys.length)
            for(let j = 0; j < toKeys.length; j++) {
                this.scores.setByIndex(i,j, Math.random())
            }
        }
    }

    process(input: ProcessNodeDTO[], params: ProcessParams): SimilarityScores {
        return {
            fromEntityType: this.config.fromEntityType,
            toEntityType: this.config.toEntityType,
            matrix: this.scores
        }
    }
}