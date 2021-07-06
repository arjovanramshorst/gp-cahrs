import {RandomReproduce} from "./gp/random.reproduce.ts";
import {defaultConfig} from "./default.config.ts";
import {Recommender} from "./recommender.ts";
import {NodeConfig} from "./nodes/node.ts";
import {RootNodeConfig} from "./nodes/root.node.ts";
import {NodeFactory} from "./nodes/node.interface.ts";
import {ProblemInstance} from "./interface/problem.interface.ts";

const main = async (config = defaultConfig) => {
  // Read data
  const problem = config.makeProblem();

  // Preprocess data
  console.log(`Reading ${problem.name}...`);
  const instance = await problem.read(1);

  console.log(`...Done!`);
  const reproduce = new RandomReproduce(instance)

  const [parent1, parent2] = parents(instance)

  const res = reproduce.crossover(parent1, parent2)

  console.log("ready")
};

const parents = (instance: ProblemInstance) => [
  {
    type: "RootNodeConfig",
    config: {
      output: {
        fromType: "user",
        toType: "movie"
      },
      interactionType: "rating",
      type: "maximize",
      property: "rating",
    },
    input: [
      {
        type: "CombineNodeConfig",
        config: {
          output: {
            fromType: "user",
            toType: "movie"
          },
          type: "Similarity",
          strategy: "avg"
        },
        input: [
          {
            type: "PopularNodeConfig",
            config: {
              output: {
                fromType: "user",
                toType: "movie"
              },
              interactionType: "rating",
              compareValueKey: "rating",
            },
            input: [],
          },
          {
            type: "RandomNodeConfig",
            config: {
              output: {
                fromType: "user",
                toType: "movie"
              },
              fromEntityType: "user",
              toEntityType: "movie",
            },
            input: [],
          },
        ],
      },
    ],
  },
  {
    type: "RootNodeConfig",
    config: {
      output: {
        fromType: "user",
        toType: "movie"
      },
      interactionType: "rating",
      type: "maximize",
      property: "rating",
    },
    input: [
      {
        type: "CombineNodeConfig",
        config: {
          output: {
            fromType: "user",
            toType: "movie"
          },
          type: "Similarity",
          strategy: "avg"
        },
        input: [{
          type: "NearestNeighbourConfig",
          config: {
            output: {
              fromType: "user",
              toType: "movie"
            },
            interactionType: "rating",
            fromEntityType: "user",
            toEntityType: "movie",
            compareValueKey: "rating",
            inverted: false,
          },
          input: [{
            type: "CFNodeConfig",
            config: {
              output: {
                fromType: "user",
                toType: "user"
              },
              entityType: "user",
              interactionType: "rating",
              comparisonKey: "rating",
            },
            input: [],
          }],
        }]
      },
    ],
  }
].map(it => new Recommender(instance).init(NodeConfig.parse(it, NodeFactory) as RootNodeConfig))

await main();
