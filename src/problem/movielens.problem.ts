import { PropertyType } from "../interface/entity.interface.ts";
import { readCsv } from "../utils/csv.utils.ts";
import { groupBy, toMap, toMatrix } from "../utils/functional.utils.ts";
import { Problem } from "./problem.ts";
import { RootNodeConfig } from "../nodes/root.node.ts";
import { SparseMatrix } from "../utils/matrix.utils.ts";

interface Rating {
  fromId: number;
  toId: number;
  rating: number;
  timestamp: number;
}

export class MovielensProblem extends Problem {
  name = "Movielens Problem";
  defaultConfig = new RootNodeConfig({
    interactionType: "rating",
    type: "maximize",
    property: "rating",
  });

  async read(trainingRatio = 1) {
    const movies = await this.readMovies();
    const ratings = await this.readRatings();
    const tags = await this.readTags();

    const trainRatings: Rating[] = [];
    const testRatings: Rating[] = [];
    const validationRatings: Rating[] = [];

    const grouped = ratings.reduce(groupBy((it) => it.fromId), {});

    const selectedIds = trainingRatio === 1
      ? Object.keys(grouped).reduce(toMap((it) => it, (it) => it), {})
      : Object.keys(grouped).filter((it) => Math.random() < trainingRatio)
        .reduce(toMap((it) => it, (it) => it), {});

    Object.keys(grouped).forEach((fromRef) => {
      if (selectedIds[fromRef]) {
        const ratings = grouped[fromRef];
        // Assume ratings are sorted on time
        // .sort(...)
        ratings.forEach((it, index) => {
          if (index < 0.8 * ratings.length) {
            trainRatings.push(it);
          } else if (index < 0.9 * ratings.length && it.rating >= 3.5) {
            testRatings.push(it);
          } else if (it.rating >= 3.5) {
            validationRatings.push(it);
          }
        });
      }
    });
    const movieMatrix = movies.reduce(
      toMap(
        (it) => it.id,
        (it) => ({
          ...it,
          tags: [] as string[],
        }),
      ),
      {},
    );

    tags.forEach((tag) => movieMatrix[tag.toId].tags.push(tag.tag));

    return {
      defaultConfig: this.defaultConfig,
      testInteractions: SparseMatrix.fromArray(
        (it) => it.fromId,
        (it) => it.toId,
        (it) => it,
        testRatings,
      ),
      validateInteractions: SparseMatrix.fromArray(
        (it) => it.fromId,
        (it) => it.toId,
        (it) => it,
        validationRatings,
      ),
      interactionMap: {
        rating: {
          fromType: "user",
          toType: "movie",
          type: "rating",
          properties: {
            rating: PropertyType.number,
            timestamp: PropertyType.timestamp,
          },
          interactionMatrix: SparseMatrix.fromArray(
            (it) => it.fromId,
            (it) => it.toId,
            (it) => it,
            trainRatings,
          ),
        },
        tag: {
          fromType: "user",
          toType: "movie",
          type: "tag",
          properties: {
            tag: PropertyType.string,
            timestamp: PropertyType.timestamp,
          },
          interactionMatrix: SparseMatrix.fromArray(
            (it) => it.fromId,
            (it) => it.toId,
            (it) => it,
            tags.filter((it) => selectedIds[it.fromId]),
          ),
        },
      },
      entityMap: {
        user: {
          type: "user",
          properties: {},
          entityMatrix: Object.keys(grouped).reduce((agg, id) => ({
            ...agg,
            [id]: { id },
          }), {}),
        },
        movie: {
          type: "movie",
          properties: {
            title: PropertyType.string,
            genres: PropertyType.array,
            tags: PropertyType.array,
          },
          entityMatrix: movieMatrix,
        },
      },
    };
  }

  async readRatings() {
    return (await readCsv("ml-latest-small/ratings.csv"))
      .slice(1)
      .map((it) => ({
        fromId: Number(it[0]),
        toId: Number(it[1]),
        rating: Number(it[2]),
        timestamp: Number(it[3]),
      }));
  }

  async readMovies() {
    return (await readCsv("ml-latest-small/movies.csv"))
      .slice(1)
      .map((it) => ({
        id: Number(it[0]),
        title: it[1],
        genres: it[2].split("|"),
      }));
  }

  async readTags() {
    return (await readCsv("ml-latest-small/tags.csv"))
      .slice(1)
      .map((it) => ({
        fromId: Number(it[0]),
        toId: Number(it[1]),
        tag: it[2],
        timestamp: Number(it[3]),
      }));
  }
}
