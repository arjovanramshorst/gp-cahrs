import {zeros} from 'mathjs'
import {ReadProblemFunction} from "../interface/problem.interface";

import {generateMulberrySeed, mulberry32, sample} from "../utils/random.utils";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
import {readCsvFile} from "../utils/fs.utils";
import {distinct, groupBy, toIdxMap} from "../utils/functional.utils";
import {FUNCTIONS as f} from "../utils/trial.utils";

const GOAL_SIZE_USERS = 1000
const GOAL_SIZE_PRODUCTS = 1000
const SPARSE_START = 0.2

export const readSobazaar: ReadProblemFunction = async (
  interleaveSize: number = 1,
  interleaveSeed: number = generateMulberrySeed(),
  actionToRecommend: string = "purchase:buy_clicked",
  type: 'dense' | 'sparse'| undefined = undefined
) => {
  const interactions = await readInteractions();

  const PRG = mulberry32(interleaveSeed)

  const interactionsByUser = groupBy(interactions, it => it.UserID, it => it)
  // FILTER Items with no interactions to recommend, otherwise validation will never work
  Object.keys(interactionsByUser).forEach(userRef => {
    if (interactionsByUser[userRef].filter(it => it.Action === actionToRecommend).length === 0) {
      delete interactionsByUser[userRef]
    }
  })

  const interactionsByProduct = groupBy(interactions, it => it.ItemID, it => it)
  if (type === 'sparse') {
    const users = Object.keys(interactionsByUser).length
    // DELETE interactions for users
    Object.keys(interactionsByUser).sort((a,b) => interactionsByUser[a].length - interactionsByUser[b].length)
      .forEach((ref, idx) => {
        if (idx < SPARSE_START * users) {
          delete interactionsByUser[ref]
        } else if (idx > SPARSE_START * users + GOAL_SIZE_USERS) {
          delete interactionsByUser[ref]
        }
      })
    // Only keep the products with the most interactions
    Object.keys(interactionsByProduct).sort((a,b) => interactionsByProduct[b].length - interactionsByProduct[a].length)
      .slice(GOAL_SIZE_PRODUCTS).forEach(ref => { delete interactionsByProduct[ref]})
    // Object.keys(interactionsByUser).sort((a,b) => interactionsByUser[b].length - interactionsByUser[a].length)
    //   .slice(GOAL_SIZE_USERS).forEach(ref => { delete interactionsByUser[ref]})
    // Object.keys(interactionsByProduct).sort((a,b) => interactionsByProduct[a].length - interactionsByProduct[b].length)
    //   .slice(GOAL_SIZE_USERS).forEach(ref => { delete interactionsByProduct[ref]})
  } else if (type === 'dense') {
    Object.keys(interactionsByUser).sort((a,b) => interactionsByUser[b].length - interactionsByUser[a].length)
      .slice(GOAL_SIZE_USERS).forEach(ref => { delete interactionsByUser[ref]})
    Object.keys(interactionsByProduct).sort((a,b) => interactionsByProduct[b].length - interactionsByProduct[a].length)
      .slice(GOAL_SIZE_PRODUCTS).forEach(ref => { delete interactionsByProduct[ref]})

  } else {
    Object.keys(interactionsByProduct).forEach(productRef => {
      if (interactionsByProduct[productRef].filter(it => it.Action === actionToRecommend).length < 5) {
        delete interactionsByProduct[productRef]
      }
    })
  }


  const filteredInteractions = interactions.filter(it => !!interactionsByUser[it.UserID] && !!interactionsByProduct[it.ItemID])

  const userRefs = distinct(filteredInteractions, it => it.UserID)
  const numberOfUsers = Math.floor(interleaveSize * userRefs.length)

  const sampledUserRefs = interleaveSize === 1 ? userRefs : sample(userRefs, numberOfUsers, PRG)
  const userToIdxMap = sampledUserRefs.reduce(toIdxMap, {})
  const productRefs = distinct(filteredInteractions, it => it.ItemID)
  const productToIdxMap = productRefs.reduce(toIdxMap, {})

  const filteredByAction = groupBy(
    filteredInteractions.filter(it => !!userToIdxMap[it.UserID]),
    it => it.Action,
    it => it
  )

  const filter: number[][] = []
  const validate: number[][] = []
  sampledUserRefs.forEach(_ => {
    filter.push([]);
    validate.push([])
  })

  const interactionMatrices = {}

  interactionMatrices[actionToRecommend] = zeros([sampledUserRefs.length, productRefs.length]) as number[][]
  const recommendPerUser = groupBy(filteredByAction[actionToRecommend], it => it.UserID, it => it)
  // Handle action to recommend
  Object.keys(recommendPerUser)
    .forEach(userRef => {
      const actions = recommendPerUser[userRef]
      actions
        .sort((a, b) => a.Timestamp.localeCompare(b.Timestamp))
        .forEach((it, idx) => {
          const userIdx = userToIdxMap[it.UserID]
          const productIdx = productToIdxMap[it.ItemID]

          // If only 1 item, it must be pushed to validate
          if (idx < Math.floor(0.8 * actions.length)) {
            interactionMatrices[it.Action][userIdx][productIdx] += 1
            filter[userIdx].push(productIdx)
          } else {
            validate[userIdx].push(productIdx)
          }
        })
    })

  Object.keys(filteredByAction)
    .forEach(action => {
      // Handle other actions
      if (action !== actionToRecommend) {
        interactionMatrices[action] = zeros([sampledUserRefs.length, productRefs.length]) as number[][]
        filteredByAction[action].forEach(it => {
          const userIdx = userToIdxMap[it.UserID]
          const productIdx = productToIdxMap[it.ItemID]
          if (validate[userIdx].indexOf(productIdx) === -1) {
            interactionMatrices[it.Action][userIdx][productIdx] += 1
          }
        })
      }
    })


  return {
    problemName: ["sobazaar", type].filter(it => !!it).join("-"),
    interleaveSize,
    interleaveSeed,

    output: {
      dtoType: DTOType.matrix,
      fromEntity: "user",
      toEntity: "product",
    } as DTOMatrix,

    validate,
    filter,

    entities: {
      user: {
        type: "user",
        refsToIdx: userToIdxMap,
        properties: {}
      },
      product: {
        type: "product",
        refsToIdx: productToIdxMap,
        properties: {}
      }
    },
    interactions: Object.keys(interactionMatrices).reduce((agg, action) => {
      agg[action] = {
        type: action,
        fromEntityType: "user",
        toEntityType: "product",

        interactions: interactionMatrices[action]
      }
      return agg
    }, {}),
    // Popularity, since that is best performing baseline
    baseline: f.addVector()([
      f.fillMatrix('user', 'product', 0),
      f.popularity()([
        f.interaction('purchase:buy_clicked')])]),

    baselines: [
      // ['Empty', f.fillMatrix('user', 'product', 0)],
      // ['interaction', f.interaction('content:interact:product_detail_viewed')],
      // ['interaction', f.interaction('product_detail_clicked')],
      // ['interaction', f.interaction('product_wanted')],

      ['Popularity', f.addVector()([
        f.fillMatrix('user', 'product', 0),
        f.popularity()([
          f.interaction('purchase:buy_clicked')])])],

      ['User CF', f.nearestNeighbour(15)([
        f.pearson()([
          f.interaction('product_detail_clicked')]),
        f.interaction('purchase:buy_clicked')])],

      ['Item CF', f.invertedNN(15)([
        f.pearson()([
          f.transpose()([
            f.interaction('product_detail_clicked')])]),
        f.interaction('purchase:buy_clicked')])]
    ]
  }
}

const readInteractions = async () => {
  return await readCsvFile<{ Action: string, Timestamp: string, ItemID: string, UserID: string }>(
    "../resources/sobazaar/Sobazaar-hashID.csv",
  )
}
