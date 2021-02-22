import { parse, path } from "../deps.ts";

export { readCsv };

async function readCsv(filename: string): Promise<string[][]> {
  const uri = path.join(Deno.cwd(), `../resources/${filename}`);
  return parse(await Deno.readTextFile(uri)) as Promise<string[][]>;
}
