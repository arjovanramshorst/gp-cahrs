import {zeros} from "mathjs"
import {generateMulberrySeed, mulberry32, pick, sample} from "../utils/random.utils";
import {PropertyType, ReadProblemFunction} from "../interface/problem.interface";
import {readCsvFile} from "../utils/fs.utils";
import {groupBy, toIdxMap} from "../utils/functional.utils";
import {DTOMatrix, DTOType} from '../interface/dto.interface';
import {ConfigTree, fun} from "../tree";

export const readMovieLens: ReadProblemFunction = async (
  interleaveSize: number = 1,
  interleaveSeed: number = generateMulberrySeed(),
) => {
  const movies = await readMovies();
  const ratings = await readRatings();
  const tags = await readTags();


  const PRG = mulberry32(interleaveSeed)

  const ratingsByUser = groupBy(ratings, (it) => it.userId)

  const numberOfUsers = Math.floor(interleaveSize * Object.keys(ratingsByUser).length)

  const movieRefs = movies.map(it => it.movieId)
  const movieToIdxMap = movieRefs.reduce(toIdxMap, {})

  const userRefs = interleaveSize === 1 ? Object.keys(ratingsByUser) : sample(Object.keys(ratingsByUser), numberOfUsers, PRG)

  const userToIdxMap = userRefs.reduce(toIdxMap, {})

  const ratingMatrix: number[][] = zeros([userRefs.length, movieRefs.length]) as number[][]
  const tagMatrix: number[][] = zeros([userRefs.length, movieRefs.length]) as number[][]

  const filter: number[][] = []
  const validate: number[][] = []

  Object.keys(ratingsByUser)
    .filter(userId => userToIdxMap[userId] !== undefined)
    .forEach((userId, userIndex) => {
      const ratings = ratingsByUser[userId]
      filter.push([])
      validate.push([])
      ratings
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach((rating, index) => {
          if (index < 0.9 * ratings.length) {

            ratingMatrix[userToIdxMap[rating.userId]][movieToIdxMap[rating.movieId]] = Number(rating.rating)

            filter[userIndex].push(movieToIdxMap[rating.movieId])
          } else if (rating.rating >= 3.5) {
            validate[userIndex].push(movieToIdxMap[rating.movieId])
          }
        })
    })

  const movieTags: string[][] = [...Array(movieRefs.length).keys()].map(_ => [])
  tags
    .filter(it => userToIdxMap[it.userId] !== undefined)
    .forEach(tag => {
      tagMatrix[userToIdxMap[tag.userId]][movieToIdxMap[tag.movieId]] = 1
      movieTags[movieToIdxMap[tag.movieId]].push(tag.tag)
    })

  return {
    output: {
      dtoType: DTOType.matrix,
      fromEntity: "user",
      toEntity: "movie",
      rows: userRefs.length,
      columns: movieRefs.length
    } as DTOMatrix,

    validate: validate,
    filter: filter,

    entities: {

      user: {
        type: "user",
        refsToIdx: userToIdxMap,
        properties: {}
      },
      movie: {
        type: "movie",
        refsToIdx: movieToIdxMap,
        properties: {
          title: {
            property: "title",
            type: PropertyType.string,
            items: movies.map(it => it.title)
          },
          genres: {
            property: "genres",
            type: PropertyType.array,
            items: movies.map(it => it.genres.split("|"))
          },
          tags: {
            property: "tags",
            type: PropertyType.array,
            items: movieTags
          }
        }
      }
    },

    interactions: {
      rating: {
        type: "rating",
        fromEntityType: "user",
        toEntityType: "movie",
        interactions: ratingMatrix
      },
      tag: {
        type: "tag",
        fromEntityType: "user",
        toEntityType: "movie",
        interactions: tagMatrix
      }
    },

    baseline: baseline2(userRefs.length, movieRefs.length)
  }
};

const readMovies = async () => {
  return await readCsvFile<{ movieId: string; title: string; genres: string }>(
    "../resources/ml-latest-small/movies.csv",
  );
};

const readRatings = async () => {
  return await readCsvFile<{ userId: string; movieId: string, rating: number, timestamp: number }>(
    "../resources/ml-latest-small/ratings.csv",
  )
}

const readTags = async () => {
  return await readCsvFile<{ userId: string, movieId: string, tag: string, timestamp: number }>(
    "../resources/ml-latest-small/tags.csv",
  )
}

const baseline = (users: number, movies: number): ConfigTree => fun(
  "addVector",
  {},
  [
    fun("randomMatrix", {seed: 0, output: {dtoType: DTOType.matrix, rows: users, columns: movies}}),
    fun("popularity", {}, [fun(
      "interaction(rating)",
      {},
      []
    )])
  ]
)

const baseline2 = (users: number, movies: number): ConfigTree => fun(
  "nearestNeighbour",
  {N: 5},
  [
    fun("pearsonSimilarity", {N: 10}, [
      fun("interaction(rating)", {}, [])
    ]),
    fun("interaction(rating)", {}, [])
  ]
)
