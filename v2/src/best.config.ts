import {ConfigTree} from "./tree";
import {DTOMatrix} from "./interface/dto.interface";

export const bestConfig = {
  "config": {
    "type": "nearestNeighbour",
    "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "movie", "rows": 610, "columns": 9742} as DTOMatrix,
    "N": 100
  },
  "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "movie", "rows": 610, "columns": 9742} as DTOMatrix,
  "input": [{
    "config": {"type": "pearsonSimilarity"},
    "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
    input: [{
      "config": {"type": "interaction(rating)"},
      "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "movie", "rows": 610, "columns": 9742},
      "input": []
    }]
  }, {
    "config": {"type": "interaction(rating)"},
    "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "movie", "rows": 610, "columns": 9742},
    "input": []
  }]
}


//     [{
//     "config": {"type": "multiply"},
//     "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//     "input": [{
//       "config": {"type": "subtract"},
//       "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//       "input": [{
//         "config": {"type": "randomScalar", "output": {"dtoType": "scalar"}, "seed": 6},
//         "output": {"dtoType": "scalar"},
//         "input": []
//       }, {
//         "config": {
//           "type": "randomMatrix",
//           "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//           "seed": 3030384578
//         },
//         "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//         "input": []
//       }]
//     }, {
//       "config": {
//         "type": "nearestNeighbour",
//         "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//         "N": 3
//       },
//       "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//       "input": [{
//         "config": {
//           "type": "randomMatrix",
//           "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//           "seed": 1250517510
//         },
//         "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//         "input": []
//       }, {
//         "config": {
//           "type": "randomMatrix",
//           "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//           "seed": 1528652549
//         },
//         "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//         "input": []
//       }]
//     }]
//   }, {
//     "config": {
//       "type": "nearestNeighbour",
//       "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "movie", "rows": 610, "columns": 9742},
//       "N": 2
//     },
//     "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "movie", "rows": 610, "columns": 9742},
//     "input": [{
//       "config": {"type": "compareNumber"},
//       "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "user", "rows": 610, "columns": 610},
//       "input": [{
//         "config": {
//           "type": "randomVector",
//           "output": {"dtoType": "vector", "entity": "user", "items": 610, "valueType": "number"},
//           "seed": 3061594824
//         }, "output": {"dtoType": "vector", "entity": "user", "items": 610, "valueType": "number"}, "input": []
//       }, {
//         "config": {
//           "type": "randomVector",
//           "output": {"dtoType": "vector", "entity": "user", "items": 610, "valueType": "number"},
//           "seed": 1948592435
//         }, "output": {"dtoType": "vector", "entity": "user", "items": 610, "valueType": "number"}, "input": []
//       }]
//     }, {
//       "config": {"type": "sum"},
//       "output": {"dtoType": "matrix", "fromEntity": "user", "toEntity": "movie", "rows": 610, "columns": 9742},
//       "input": [{
//         "config": {"type": "randomScalar", "output": {"dtoType": "scalar"}, "seed": 6},
//         "output": {"dtoType": "scalar"},
//         "input": []
//       }, ]
//     }]
//   }]
// }
