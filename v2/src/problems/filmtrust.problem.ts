import {ReadProblemFunction} from "../interface/problem.interface";
import {generateMulberrySeed, mulberry32, sample} from "../utils/random.utils";
import {readCsvFile} from "../utils/fs.utils";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
import {FUNCTIONS as f} from "../utils/trial.utils";
import {groupBy, toIdxMap} from "../utils/functional.utils";
import {zeros} from "mathjs";

const MIN_RATINGS = 10

export const readFilmTrust: ReadProblemFunction = async (
  interleaveSize: number = 1,
  interleaveSeed: number = generateMulberrySeed(),
  actionToRecommend
) => {
  const ratings = await readRatings()
  const trusts = await readTrust()

  const PRG = mulberry32(interleaveSeed)

  // Handle users:
  const ratingsByUser = groupBy(ratings, (it) => it.userId, it => it)
  Object.keys(ratingsByUser).forEach(userRef => {
    if (ratingsByUser[userRef].length < MIN_RATINGS) {
      delete ratingsByUser[userRef]
    }
  })
  const numberOfUsers = Math.floor(interleaveSize * Object.keys(ratingsByUser).length)
  const userRefs = interleaveSize === 1 ? Object.keys(ratingsByUser) : sample(Object.keys(ratingsByUser), numberOfUsers, PRG)
  const userToIdxMap = userRefs.reduce(toIdxMap, {})

  // Handle movies
  const ratingsByMovie = groupBy(ratings, (it) => it.movieId, it => it)
  const movieRefs = Object.keys(ratingsByMovie)
  const movieToIdxMap = movieRefs.reduce(toIdxMap, {})

  const ratingMatrix: number[][] = zeros([userRefs.length, movieRefs.length]) as number[][]

  const validate = []
  const filter = []

  Object.keys(ratingsByUser)
    .filter(userId => userToIdxMap[userId] !== undefined)
    .forEach((userId) => {
      const ratings = ratingsByUser[userId]
      const userIdx = userToIdxMap[userId]
      filter.push([])
      validate.push([])
      ratings
        .forEach((rating, index) => {
          /*
          The following method is now used for evaluation:

          Potential for using likes/dislikes instead of just exists

          https://1217da17-9e55-4056-9ed5-cfc740db36eb.filesusr.com/ugd/913b85_7eb4d8b5b92c439d82451e0302733b75.pdf
           */
          const movieIdx = movieToIdxMap[rating.movieId]
          if (index < 0.8 * ratings.length) {
            ratingMatrix[userIdx][movieIdx] = Number(rating.rating) //Number(rating.rating)

            filter[userIdx].push(movieIdx)
          } else {
            if (rating.rating >= 3) {
              validate[userIdx].push(movieToIdxMap[rating.movieId])
            }
          }
        })
    })

  const trustMatrix: number[][] = zeros([userRefs.length, userRefs.length]) as number[][]

  trusts.forEach(trust => {
    const trustorId = userToIdxMap[trust.trustor]
    const trusteeId = userToIdxMap[trust.trustee]
    if (trustorId && trusteeId) {
      trustMatrix[trustorId][trusteeId] = trust.value
    }
  })

  return {
    problemName: "filmtrust",
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
      movie: {
        type: "movie",
        refsToIdx: movieToIdxMap,
        properties: {}
      }
    },

    interactions: {
      rating: {
        type: "rating",
        fromEntityType: "user",
        toEntityType: "movie",
        interactions: ratingMatrix
      },
      trust: {
        type: "trust",
        fromEntityType: "user",
        toEntityType: "user",
        interactions: trustMatrix
      }
    },

    baseline,

    baselines: [
      // ['Empty', f.fillMatrix('user', 'movie', 0)],
      // ['Rating', f.interaction('rating')],
      // ['Popularity', f.addVector()([
      //   f.fillMatrix('user', 'movie', 0),
      //   f.popularity()([
      //     f.interaction('rating')])])],
      // ['Popularity', f.addVector()([
      //   f.fillMatrix('user', 'movie', 0),
      //   f.popularity()([
      //     f.interaction('rating')])])],
      ['Popularity', f.addVector()([
        f.fillMatrix('user', 'movie', 0),
        f.popularity()([
          f.interaction('rating')])])],

      ['User CF', f.nearestNeighbour(15)([
        f.pearson()([
          f.interaction('rating')]),
        f.interaction('rating')])],

      ["Item CF", baseline],
    ]
  }
}

const readRatings = async () => {
  return await readCsvFile<{ userId: string, movieId: string, rating: number }>(
    "./data/filmtrust/ratings.txt",
    {
      headers: ['userId', 'movieId', 'rating'],
      mapValues: ({header, value}) => {
        switch (header) {
          case 'rating':
            return Number(value)
          default:
            return value
        }
      },
      separator: " ",
    }
  );
};

const readTrust = async () => {
  return await readCsvFile<{ trustor: string, trustee: string, value: number }>(
    "./data/filmtrust/trust.txt",
    {
      headers: ['trustor', 'trustee', 'value'],
      mapValues: ({header, value}) => {
        switch (header) {
          case 'value':
            return Number(value)
          default:
            return value
        }
      },
      separator: " ",
    }
  );
}

const baseline = f.invertedNN(15)([
  f.pearson()([
    f.transpose()([
      f.interaction('rating')])]),
  f.interaction('rating')])