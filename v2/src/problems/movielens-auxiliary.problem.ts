import {zeros} from "mathjs"
import {generateMulberrySeed, mulberry32, pick, sample} from "../utils/random.utils";
import {PropertyType, ReadProblemFunction} from "../interface/problem.interface";
import {readCsvFile} from "../utils/fs.utils";
import {asMatrix, associateWithMany, groupBy, toIdxMap} from "../utils/functional.utils";
import {DTOMatrix, DTOType} from '../interface/dto.interface';
import {ConfigTree, fun} from "../tree";
import {FUNCTIONS} from "../utils/trial.utils";

export const readMovieLensV2: ReadProblemFunction = async (
  interleaveSize: number = 1,
  interleaveSeed: number = generateMulberrySeed(),
) => {
  const movies = await readMovies();
  const ratings = await readRatings();
  // const tags = await readTags();

  const PRG = mulberry32(interleaveSeed)

  const ratingsByUser = groupBy(ratings, (it) => it.userId, it => it)

  const numberOfUsers = Math.floor(interleaveSize * Object.keys(ratingsByUser).length)

  const movieRefs = movies.map(it => it.movieId)
  const movieToIdxMap = movieRefs.reduce(toIdxMap, {})
  const movieParams = {
    refs: movieRefs,
    refsToIdx: movieToIdxMap
  }
  const genreMap = associateWithMany(movies, it => it.genres, it => it.movieId)
  const genreRefs = Object.keys(genreMap)
  const genreToIdxMap = genreRefs.reduce(toIdxMap, {})
  const genreParams = {
    refs: genreRefs,
    refsToIdx: genreToIdxMap
  }
  const genreMatrix = asMatrix({
    from: genreParams,
    to: movieParams,
    interactionMap: genreMap
  })

  const actorMap = associateWithMany(movies, it => it.actors, it => it.movieId)
  const actorRefs = Object.keys(actorMap)
  const actorToIdxMap = actorRefs.reduce(toIdxMap, {})
  const actorParams = {
    refs: actorRefs,
    refsToIdx: actorToIdxMap
  }
  const actorMatrix = asMatrix({
    from: actorParams,
    to: movieParams,
    interactionMap: actorMap
  })

  const userRefs = interleaveSize === 1 ? Object.keys(ratingsByUser) : sample(Object.keys(ratingsByUser), numberOfUsers, PRG)

  const userToIdxMap = userRefs.reduce(toIdxMap, {})

  const ratingMatrix: number[][] = zeros([userRefs.length, movieRefs.length]) as number[][]
  // const tagMatrix: number[][] = zeros([userRefs.length, movieRefs.length]) as number[][]


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
          // TODO: Add some consistent way of validation here?

          /*
          The following method is now used for evaluation:

          https://1217da17-9e55-4056-9ed5-cfc740db36eb.filesusr.com/ugd/913b85_7eb4d8b5b92c439d82451e0302733b75.pdf
           */
          if (index < 0.8 * ratings.length) {
            ratingMatrix[userToIdxMap[rating.userId]][movieToIdxMap[rating.movieId]] = 1 //Number(rating.rating)

            filter[userIndex].push(movieToIdxMap[rating.movieId])
          } else {
            validate[userIndex].push(movieToIdxMap[rating.movieId])
          }
        })
    })

  // const movieTags: string[][] = [...Array(movieRefs.length).keys()].map(_ => [])
  // tags
  //   .filter(it => userToIdxMap[it.userId] !== undefined)
  //   .forEach(tag => {
  //     const userIdx = userToIdxMap[tag.userId]
  //     const movieIdx = movieToIdxMap[tag.movieId]
  //     // Only add tags for movies a user has not yet rated to the matrix
  //     if (validate[userIdx].indexOf(movieIdx) === -1) {
  //       tagMatrix[userIdx][movieIdx] = 1
  //       movieTags[movieToIdxMap[tag.movieId]].push(tag.tag)
  //     }
  //   })

  return {
    problemName: "movielens2",
    interleaveSize,
    interleaveSeed,

    output: {
      dtoType: DTOType.matrix,
      fromEntity: "user",
      toEntity: "movie",
    } as DTOMatrix,

    validate: validate,
    filter: filter,

    entities: {

      user: {
        type: "user",
        refsToIdx: userToIdxMap,
        properties: {}
      },
      actor: {
        type: "actor",
        refsToIdx: actorToIdxMap,
        properties: {}
      },
      genre: {
        type: "genre",
        refsToIdx: genreToIdxMap,
        properties: {}
      },
      movie: {
        type: "movie",
        refsToIdx: movieToIdxMap,
        properties: {
          genres: {
            property: "genres",
            type: PropertyType.array,
            items: movies.map(it => it.genres)
          },
          actors: {
            property: "actors",
            type: PropertyType.array,
            items: movies.map(it => it.actors)
          },
          director: {
            property: "director",
            type: PropertyType.string,
            items: movies.map(it => it.director)
          },
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
      acts: {
        type: "acts",
        fromEntityType: "actor",
        toEntityType: "movie",
        interactions: actorMatrix
      },
      genre: {
        type: "genre",
        fromEntityType: "genre",
        toEntityType: "movie",
        interactions: genreMatrix
      }
    },

    baseline: FUNCTIONS.invertedNN(15)([
      FUNCTIONS.pearson()([
        FUNCTIONS.transpose()([
          FUNCTIONS.interaction('rating')])]),
      FUNCTIONS.interaction('rating')])
  }
};

const readMovies = async () => {
  return await readCsvFile<{ movieId: string; genres: string[]; director: string; actors: string[] }>(
    "./data/ml/auxiliary-mapping.txt",
    {
      headers: ['movieId', 'genres', 'director', 'actors'],
      mapValues: ({header, value}) => {
        switch (header) {
          case 'genres':
          case 'actors':
            return value.split(",")
          default:
            return value
        }
      },
      separator: "|",
    }
  );
};

const readRatings = async () => {
  return await readCsvFile<{ userId: string; movieId: string, rating: number, timestamp: number }>(
    "./data/ml/rating-delete-missing-itemid.txt",
    {
      headers: ['userId', 'movieId', 'rating', 'timestamp'],
      mapValues: ({header, value}) => {
        switch (header) {
          case 'rating':
          case 'timestamp':
            return Number(value)
          default:
            return value
        }
      },
      separator: "\t"
    }
  )
}

// const readTags = async () => {
//   return await readCsvFile<{ userId: string, movieId: string, tag: string, timestamp: number }>(
//     "../resources/ml-latest-small/tags.csv",
//   )
// }

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
