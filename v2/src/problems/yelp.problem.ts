import {zeros} from "mathjs"
import {generateMulberrySeed, mulberry32, pick, sample} from "../utils/random.utils";
import {PropertyType, ReadProblemFunction} from "../interface/problem.interface";
import {readCsvFile} from "../utils/fs.utils";
import {asMatrix, associateWithMany, groupBy, toIdxMap} from "../utils/functional.utils";
import {DTOMatrix, DTOType} from '../interface/dto.interface';
import {FUNCTIONS} from "../utils/trial.utils";

export const readYelp: ReadProblemFunction = async (
  interleaveSize: number = 1,
  interleaveSeed: number = generateMulberrySeed(),
) => {
  /*
  entities:
  location
    categories
    city
  category
  city
  user

  interactions:
  review
   */
  const locations = await readLocations();
  const trainReviews = await readReviews("./data/yelp/training.txt");
  const testReviews = await readReviews("./data/yelp/test.txt");
  // const tags = await readTags();

  const PRG = mulberry32(interleaveSeed)

  const reviewsByUser = groupBy(trainReviews, (it) => it.userId, it => it)

  const numberOfUsers = Math.floor(interleaveSize * Object.keys(reviewsByUser).length)

  const locationRefs = locations.map(it => it.locationId)
  const locationToIdxMap = locationRefs.reduce(toIdxMap, {})
  const locationParams = {
    refs: locationRefs,
    refsToIdx:locationToIdxMap
  }

  const categoryMap = associateWithMany(locations, it => it.categories, it => it.locationId)
  const categoryRefs = Object.keys(categoryMap)
  const categoryToIdxMap = categoryRefs.reduce(toIdxMap, {})
  const categoryParams = {
    refs: categoryRefs,
    refsToIdx: categoryToIdxMap
  }
  const categoryMatrix = asMatrix({
    from: categoryParams,
    to: locationParams,
    interactionMap: categoryMap
  })

  const cityMap = groupBy(locations, it => it.city, it => it.locationId)
  const cityRefs = Object.keys(cityMap)
  const cityToIdxMap = cityRefs.reduce(toIdxMap, {})
  const cityParams = {
    refs: cityRefs,
    refsToIdx: cityToIdxMap
  }
  const inCityMatrix = asMatrix({
    from: cityParams,
    to: locationParams,
    interactionMap: cityMap
  })

  const userRefs = interleaveSize === 1 ? Object.keys(reviewsByUser) : sample(Object.keys(reviewsByUser), numberOfUsers, PRG)

  const userToIdxMap = userRefs.reduce(toIdxMap, {})

  const reviewMatrix: number[][] = zeros([userRefs.length, locationRefs.length]) as number[][]

  const filter: number[][] = new Array(numberOfUsers).fill([])
  const validate: number[][] = new Array(numberOfUsers).fill([])

  trainReviews.forEach(it => {
    const userIdx = userToIdxMap[it.userId]
    const locationIdx = locationToIdxMap[it.locationId]
    reviewMatrix[userIdx][locationIdx] = 1
    filter[userIdx].push(locationIdx)
  })

  testReviews.forEach(it => {
    const userIdx = userToIdxMap[it.userId]
    const locationIdx = locationToIdxMap[it.locationId]
    validate[userIdx].push(locationIdx)
  })


  return {
    problemName: "movielens2",
    interleaveSize,
    interleaveSeed,

    output: {
      dtoType: DTOType.matrix,
      fromEntity: "user",
      toEntity: "location",
    } as DTOMatrix,

    validate: validate,
    filter: filter,

    entities: {

      user: {
        type: "user",
        refsToIdx: userToIdxMap,
        properties: {}
      },
      location: {
        type: "location",
        refsToIdx: locationToIdxMap,
        properties: {
          categories: {
            property: "categories",
            type: PropertyType.array,
            items: locations.map(it => it.categories)
          },
          city: {
            property: "city",
            type: PropertyType.string,
            items: locations.map(it => it.city)
          },
        }
      },
      category: {
        type: "category",
        refsToIdx: categoryToIdxMap,
        properties: {}
      },
      city: {
        type: "city",
        refsToIdx: cityToIdxMap,
        properties: {}
      }
    },

    interactions: {
      review: {
        type: "review",
        fromEntityType: "user",
        toEntityType: "location",
        interactions: reviewMatrix
      },
      inCity: {
        type: "inCity",
        fromEntityType: "location",
        toEntityType: "city",
        interactions: inCityMatrix
      },
      inCategory: {
        type: "inCategory",
        fromEntityType: "location",
        toEntityType: "category",
        interactions: categoryMatrix
      }
    },

    baseline: FUNCTIONS.invertedNN(15)([
      FUNCTIONS.pearson()([
        FUNCTIONS.transpose()([
          FUNCTIONS.interaction('review')])]),
      FUNCTIONS.interaction('review')])
  }
};

const readLocations = async () => {
  return await readCsvFile<{ locationId: string; categories: string[]; city: string }>(
    "./data/yelp/auxiliary-mapping.txt",
    {
      headers: ['locationId', 'categories', 'city'],
      mapValues: ({header, value}) => {
        switch (header) {
          case 'categories':
            return value.split(",")
          default:
            return value
        }
      },
      separator: "|",
    }
  );
};

const readReviews = async (file: string) => {
  return await readCsvFile<{ userId: string; locationId: string }>(
    file,
    {
      headers: ['userId', 'locationId'],
      mapValues: ({header, value}) => {
        switch (header) {
          default:
            return value
        }
      },
      separator: "\t"
    }
  )
}
