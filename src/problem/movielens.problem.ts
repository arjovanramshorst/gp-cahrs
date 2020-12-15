import {PropertyType} from "../interface/entity.interface.ts";
import {readCsv} from "../utils/csv.utils.ts";
import {groupBy, toMap, toMatrix} from "../utils/functional.utils.ts";
import {Problem} from "./problem.ts";
import {RootNodeConfig} from "../nodes/root.node.ts";

interface Rating {
    fromId: number,
    toId: number,
    rating: number,
    timestamp: number
}

export class MovielensProblem extends Problem {
    name = "Movielens Problem"
    defaultConfig = new RootNodeConfig({
        interactionType: "rating",
        type: "maximize",
        property: "rating"
    })

    async read() {
        const movies = await this.readMovies()
        const ratings = await this.readRatings()
        const tags = await this.readTags()

        const trainRatings: Rating[] = []
        const testRatings: Rating[] = []

        const grouped = ratings.reduce(groupBy(it => it.fromId), {})
        Object.keys(grouped).forEach(fromRef => {
            const ratings = grouped[fromRef]
            // Assume ratings are sorted on time
            // .sort(...)
            ratings.forEach((it, index) => {
                if (index < 0.9 * ratings.length) {
                    trainRatings.push(it)
                } else if (it.rating >= 4) {
                    testRatings.push(it)
                }
            })

        })

        return {
            defaultConfig: this.defaultConfig,
            testInteractions: testRatings
                .reduce(toMatrix(
                    it => it.fromId,
                    it => it.toId,
                    it => it
                ), {}),
            interactionMap: {
                rating: {
                    fromType: "user",
                    toType: "movie",
                    type: "rating",
                    properties: {
                        rating: PropertyType.number,
                        timestamp: PropertyType.timestamp
                    },
                    interactionMatrix: trainRatings
                        .reduce(toMatrix(
                            it => it.fromId,
                            it => it.toId,
                            it => it
                        ), {})
                },
                tag: {
                    fromType: "user",
                    toType: "movie",
                    type: "tag",
                    properties: {
                        tag: PropertyType.string,
                        timestamp: PropertyType.timestamp
                    },
                    interactionMatrix: tags
                        .reduce(toMatrix(
                            it => it.fromId,
                            it => it.toId,
                            it => it
                        ), {})
                }
            },
            entityMap: {
                user: {
                    type: "user",
                    properties: {},
                    entityMatrix: ratings.reduce(toMap(
                        it => it.fromId,
                        it => ({
                            id: it.fromId
                        })), {})

                },
                movie: {
                    type: "movie",
                    properties: {
                        title: PropertyType.string,
                        genres: PropertyType.array
                    },
                    entityMatrix: movies.reduce(toMap(
                        it => it.id,
                        it => it
                    ), {})
                }
            }
        }
    }


    async readRatings() {
        return (await readCsv("ml-latest-small/ratings.csv"))
            .slice(1)
            .map(it => ({
                fromId: Number(it[0]),
                toId: Number(it[1]),
                rating: Number(it[2]),
                timestamp: Number(it[3])
            }))
    }

    async readMovies() {
        return (await readCsv("ml-latest-small/movies.csv"))
            .slice(1)
            .map(it => ({
                id: Number(it[0]),
                title: it[1],
                genres: it[2].split("|")
            }))
    }

    async readTags() {
        return (await readCsv("ml-latest-small/tags.csv"))
            .slice(1)
            .map(it => ({
                fromId: Number(it[0]),
                toId: Number(it[1]),
                tag: it[2],
                timestamp: Number(it[3])
            }))
    }
}

