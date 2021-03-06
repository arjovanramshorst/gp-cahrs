import { defaultConfig } from "./default.config.ts";
import { JsonConfig } from "./nodes/node.interface.ts";
import { Result } from "./evaluate/evaluator.ts";
import { Recommender } from "./recommender.ts";
import { getRenderer } from "./renderer.ts";

export interface WorkerRequest {
  generation: number;
  idx: number;
  worker: number;
  recommenderHash: JsonConfig;
  interleaveSize: number;
  interleaveSeed?: number;
}

export interface WorkerResponse {
  generation: number;
  idx: number;
  recommenderHash: JsonConfig;
  result: Result;
  worker: number;
  interleaveSize: number;
}

// @ts-ignore workers work anyway
self.onmessage = async ({ data }: { data: WorkerRequest }) => {
  getRenderer().setHeadless(true, data.worker, data.generation, data.idx);
  console.log("Worker received message");
  const config = defaultConfig;
  const problem = config.makeProblem();
  const instance = await problem.read(data.interleaveSize, data.interleaveSeed);
  const evaluator = config.makeEvaluator(instance);
  const recommender = Recommender.fromConfigHash(
    instance,
    data.recommenderHash,
  );

  recommender.prepare(instance);
  const result = evaluator.evaluate(recommender, false);

  sendResponse({
    generation: data.generation,
    idx: data.idx,
    recommenderHash: data.recommenderHash,
    result: result,
    worker: data.worker,
    interleaveSize: data.interleaveSize,
  });

  self.close();
};

const sendResponse = (response: WorkerResponse) => {
  console.log("Worker sends message");
  // @ts-ignore workers work anyway
  self.postMessage(response);
};
