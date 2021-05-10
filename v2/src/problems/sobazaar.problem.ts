import {zeros} from 'mathjs'
import {PropertyType, ReadProblemFunction} from "../interface/problem.interface";

import {generateMulberrySeed, mulberry32, sample} from "../utils/random.utils";
import {DTOMatrix, DTOType} from "../interface/dto.interface";
import {readCsvFile} from "../utils/fs.utils";
import {distinct, groupBy, toIdxMap} from "../utils/functional.utils";
import {ConfigTree, fun} from "../tree";

const ACTION_TO_RECOMMEND = "purchase:buy_clicked"

export const readSobazaar: ReadProblemFunction = async (
  interleaveSize: number = 1,
  interleaveSeed: number = generateMulberrySeed(),
) => {
  const interactions = await readInteractions();

  const PRG = mulberry32(interleaveSeed)

  const interactionsByUser = groupBy(interactions, it => it.UserID)
  const interactionsByProduct = groupBy(interactions, it => it.ItemID)
  // Filter users with less than 50 interactions? TODO: Filter based on recommended action?
  Object.keys(interactionsByUser).forEach(userRef => {
    if (interactionsByUser[userRef].filter(it => it.Action === ACTION_TO_RECOMMEND).length < 5) {
      delete interactionsByUser[userRef]
    }
  })

  Object.keys(interactionsByProduct).forEach(productRef => {
    if (interactionsByProduct[productRef].filter(it => it.Action === ACTION_TO_RECOMMEND).length < 5) {
      delete interactionsByProduct[productRef]
    }
  })
  const filteredInteractions = interactions.filter(it => !!interactionsByUser[it.UserID] && !!interactionsByProduct[it.ItemID])

  const userRefs = distinct(filteredInteractions, it => it.UserID)
  const numberOfUsers = Math.floor(interleaveSize * userRefs.length)

  const sampledUserRefs = interleaveSize === 1 ? userRefs : sample(userRefs, numberOfUsers, PRG)
  const userToIdxMap = sampledUserRefs.reduce(toIdxMap, {})
  const productRefs = distinct(filteredInteractions, it => it.ItemID)
  const productToIdxMap = productRefs.reduce(toIdxMap, {})

  const filteredByAction = groupBy(
    filteredInteractions.filter(it => !!userToIdxMap[it.UserID]),
    it => it.Action
  )

  const filter: number[][] = []
  const validate: number[][] = []
  sampledUserRefs.forEach(_ => {
    filter.push([]);
    validate.push([])
  })

  const interactionMatrices = {}
  Object.keys(filteredByAction)
    .forEach(action => {
      // Create matrix
      interactionMatrices[action] = zeros([sampledUserRefs.length, productRefs.length]) as number[][]
      if (action === ACTION_TO_RECOMMEND) {
        const recommendPerUser = groupBy(filteredByAction[action], it => it.UserID)
        Object.keys(recommendPerUser)
          .forEach(userRef => {
            const actions = recommendPerUser[userRef]
            actions
              .sort((a, b) => a.Timestamp.localeCompare(b.Timestamp))
              .forEach((it, idx) => {
                const userIdx = userToIdxMap[it.UserID]
                const productIdx = productToIdxMap[it.ItemID]
                if (idx < actions.length - 1) {
                  interactionMatrices[it.Action][userIdx][productIdx] += 1
                  // filter[userIdx].push(productIdx)
                } else {
                  validate[userIdx].push(productIdx)
                }
              })
          })
      } else {
        filteredByAction[action].forEach(it => {
          const userIdx = userToIdxMap[it.UserID]
          const productIdx = productToIdxMap[it.ItemID]
          interactionMatrices[it.Action][userIdx][productIdx] += 1
        })
      }
    })


  return {
    output: {
      dtoType: DTOType.matrix,
      fromEntity: "user",
      toEntity: "product",
      rows: sampledUserRefs.length,
      columns: productRefs.length
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
    baseline: baseline2(sampledUserRefs.length, productRefs.length)
  }
}

const baseline = (rows, columns) => {
  return fun(
    "addVector",
    {},
    [
      fun("randomMatrix", {seed: 0, output: {dtoType: DTOType.matrix, rows, columns}}),
      fun("popularity", {}, [fun(
        "interaction(purchase:buy_clicked)",
        {},
        []
      )])
    ]
  )
}
const baseline2 = (users: number, movies: number): ConfigTree => fun(
  "nearestNeighbour",
  {N: 5},
  [
    fun("pearsonSimilarity", {N: 10}, [
      fun("interaction(product_detail_clicked)", {}, [])
    ]),
    fun("interaction(purchase:buy_clicked)", {}, [])
  ]
)

const readInteractions = async () => {
  return await readCsvFile<{ Action: string, Timestamp: string, ItemID: string, UserID: string }>(
    "../resources/sobazaar/Sobazaar-hashID.csv",
  )
}
