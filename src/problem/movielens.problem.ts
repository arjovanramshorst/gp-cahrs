import { PropertyType} from "../interface/entity.interface.ts";
import {readCsv} from "../csv.utils.ts";
import {toMap, toMatrix} from "../functional.utils.ts";
import {Problem} from "./problem.ts";
import {RootNodeConfig} from "../nodes/root.node.ts";

export class MovielensProblem extends Problem {
    defaultConfig =  new RootNodeConfig({
        interactionType: "rating"
    })

    async read() {
        const movies = (await readCsv("ml-latest-small/movies.csv"))
        const ratings = (await readCsv("ml-latest-small/ratings.csv"))
        // const tags = (await readCsv("ml-latest-small/tags.csv"))

        return {
            interactionMap: {
                rating: {
                    fromType: "user",
                    toType: "movie",
                    type: "rating",
                    properties: {
                        rating: PropertyType.number,
                        timestamp: PropertyType.timestamp
                    },
                    interactionMatrix: ratings
                        .reduce(toMatrix(
                            it => Number(it[0]),
                            it => Number(it[1]),
                            it => ({
                                fromId: Number(it[0]),
                                toId: Number(it[1]),
                                rating: Number(it[2]),
                                timestamp: Number(it[3])
                            })),
                            {})
                }

            },
            entityMap: {
                user: {
                    type: "user",
                    properties: {},
                    entityMatrix: ratings.reduce(toMap(
                        it => Number(it[0]),
                        it => ({
                            id: it[0]
                        })), {})

                },
                movie: {
                    type: "movie",
                    properties: {
                        title: PropertyType.string,
                        // TODO: Deduce this automatically from input ;)
                        genres: PropertyType.array
                    },
                    entityMatrix: movies.reduce(toMap(
                        it => Number(it[0]),
                        it => ({
                            id: it[0],
                            title: it[1],
                            genres: it[2]
                        })), {})
                }
            }
        }
    }
}

