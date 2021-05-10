import {readJson} from "./utils/fs.utils";
import {printConfig} from "./utils/display.utils";
import {ConfigTree} from "./tree";

const main = async () => {
  const res: ConfigTree = await readJson("../src/pretty.json")

  printConfig(res)
}

main()
