import {ConfigTree} from "../tree";
import {printConfig} from "../utils/display.utils";
import {readJson} from "../utils/fs.utils";

const main = async () => {
  const res: ConfigTree = await readJson("../src/scripts/pretty.json")

  printConfig(res)
}
// console.log("INTERACTION:")
// const test = (asdf: string = "default") => console.log(asdf)
// test(process.env.CAHRS_RECOMMEND_INTERACTION)
main()
