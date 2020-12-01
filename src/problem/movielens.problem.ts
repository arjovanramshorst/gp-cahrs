import {PropertyType} from "../interface/entity.interface.ts";
import {readCsv} from "../csv.utils.ts";
import {toMap, toMatrix} from "../functional.utils.ts";
import {Problem} from "./problem.ts";
import {RootNodeConfig} from "../nodes/root.node.ts";

export class MovielensProblem extends Problem {
    defaultConfig = new RootNodeConfig({
        interactionType: "rating",
        type: "maximize",
        property: "rating"
    })

    async read() {
        const movies = await this.readMovies()
        const ratings = await this.readRatings()
        const tags = await this.readTags()
        const ninetypercentRatingTimestamp = ratings
            .map(it => it.timestamp)
            .sort()
            [Math.floor(ratings.length * 0.9)]

        const testRatings = ratings.filter(it => it.timestamp > ninetypercentRatingTimestamp)
            .filter(it => it.rating >= 4)
        const trainRatings = ratings.filter(it => it.timestamp <= ninetypercentRatingTimestamp)

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
            .map(it => ({
                fromId: Number(it[0]),
                toId: Number(it[1]),
                rating: Number(it[2]),
                timestamp: Number(it[3])
            }))
    }

    async readMovies() {
        return (await readCsv("ml-latest-small/movies.csv"))
            .map(it => ({
                id: Number(it[0]),
                title: it[1],
                genres: it[2].split("|")
            }))
    }

    async readTags() {
        return (await readCsv("ml-latest-small/tags.csv"))
            .map(it => ({
                fromId: Number(it[0]),
                toId: Number(it[1]),
                tag: it[2],
                timestamp: Number(it[3])
            }))
    }
}

