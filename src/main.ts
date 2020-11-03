import {Recommender} from "./recommender.ts";
import {MovielensProblem} from "./problem/movielens.problem.ts";

const main = async () => {
    // Read data
    const problem = new MovielensProblem()

    const instance = await problem.read()

    // Split train/verify
    const rs = new Recommender(instance)

    // Generate random config for now.
    rs.init(problem.defaultConfig.generate(instance))

    const output = rs.recommend(1)

    console.log(output.metadata)
    // Run CF on verification
}

await main()