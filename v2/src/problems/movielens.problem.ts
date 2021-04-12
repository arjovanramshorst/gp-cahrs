import {Matrix, zeros} from "mathjs"
import {generateMulberrySeed} from "../utils/random.utils";
import {PropertyType, ReadProblemFunction} from "../interface/problem.interface";
import {readCsvFile} from "../utils/fs.utils";
import {groupBy, toIdxMap} from "../utils/functional.utils";
import {DTOMatrix, DTOType} from '../interface/dto.interface';

export const readMovieLens: ReadProblemFunction = async (
  interleaveSize: number = 1,
  interleaveSeed: number = generateMulberrySeed(),
) => {
  const movies = await readMovies();
  const ratings = await readRatings();
  const tags = await readTags();

  const ratingsByUser = ratings.reduce(groupBy((it) => it.userId), {})

  const movieRefs = movies.map(it => it.movieId)
  const movieToIdxMap = movieRefs.reduce(toIdxMap, {})

  // TODO: Add interleaved sampling here
  const userRefs = Object.keys(ratingsByUser)
  const userToIdxMap = userRefs.reduce(toIdxMap, {})

  const ratingMatrix: any = zeros([userRefs.length, movieRefs.length], 'sparse')
  const tagMatrix: any = zeros([userRefs.length, movieRefs.length], 'sparse')

  const filter = []
  const validate = []

  Object.keys(ratingsByUser).forEach((userId, userIndex) => {
    const ratings = ratingsByUser[userId]
    filter.push([])
    validate.push([])
    ratings.forEach((rating, index) => {
      if (index < 0.9 * ratings.length) {
        ratingMatrix.set([userToIdxMap[rating.userId], movieToIdxMap[rating.movieId]], rating.rating)
        filter[userIndex].push(index)
      } else if (rating.rating >= 3.5) {
        validate[userIndex].push(index)
      }
    })
  })

  const movieTags = [...Array(movieRefs.length).keys()].map(_ => [])
  tags.forEach(tag => {
    tagMatrix.set([userToIdxMap[tag.userId], movieToIdxMap[tag.movieId]], 1)
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
    }
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